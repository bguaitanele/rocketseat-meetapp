import { parseISO, addDays } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Subscription from '../models/Subscription';
import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../libs/Queue';
import File from '../models/File';

class SubscriptionController {
  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId);
    if (!meetup) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    const { user_id, date } = meetup;

    const hasSubscriptionsSameHour = await Subscription.findOne({
      include: [{ model: Meetup, as: 'meetup', where: { date } }],
    });

    if (hasSubscriptionsSameHour) {
      return res
        .status(400)
        .json({ error: 'Já existe uma inscrição para esse mesmo horário' });
    }

    if (req.userId === user_id) {
      return res
        .status(400)
        .json({ error: 'Você não pode se inscrever em seu próprio evento' });
    }

    if (date < new Date()) {
      return res.status(400).json({ error: 'Esse evento já passou' });
    }

    const subscriptionData = {
      meetup_id: req.params.meetupId,
      user_id: req.userId,
    };
    const estaInscrito = await Subscription.findOne({
      where: subscriptionData,
    });
    if (estaInscrito) {
      return res
        .status(400)
        .json({ error: 'Você já está inscrito nesse meetup' });
    }

    const subscription = await Subscription.create(subscriptionData);

    const data = await Subscription.findByPk(subscription.id, {
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['title'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
      attributes: ['id'],
    });

    await Queue.add(SubscriptionMail.key, {
      subscription: data,
    });

    return res.json(data);

    // await Queue.add(SubscriptionMail.key, {
    //   appointment,
    // });

    // return res.json(subscription);
  }

  async index(req, res) {
    const whereMeetup = {};
    if (req.query.date) {
      const date = parseISO(req.query.date, { locale: ptBr });
      whereMeetup.date = { [Op.between]: [date, addDays(date, 1)] };
    }
    whereMeetup.date = { [Op.gte]: new Date() };
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['id'],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'title', 'description', 'address', 'date', 'past'],
          where: whereMeetup,
          include: [
            {
              model: File,
              as: 'banner',
              attributes: ['id', 'url', 'path'],
            },
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email'],
            },
          ],
        },
      ],
      order: [[{ model: Meetup, as: 'meetup' }, 'date']],
    });
    return res.json(subscriptions);
  }

  async delete(req, res) {
    if (req.organizer) {
      return res
        .status(403)
        .json({ error: 'Acesso restrito ao usuário comum.' });
    }

    const subscription = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['date'],
          where: { id: req.params.meetupId },
        },
      ],
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }

    if (subscription.meetup.date < new Date()) {
      return res
        .status(400)
        .json({ error: 'Inscrição de evento passado não pode ser excluído' });
    }

    await subscription.destroy();

    return res.json({ msg: 'Evento excluído' });
  }
}

export default new SubscriptionController();
