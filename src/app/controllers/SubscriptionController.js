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

    let data = await Subscription.findByPk(subscription.id, {
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
    if (req.organizer) {
      return res
        .status(403)
        .json({ error: 'Acesso restrito ao usuário comum.' });
    }

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
          include: [
            {
              model: File,
              as: 'banner',
              attributes: ['id', 'url'],
            },
          ],
        },
      ],
      order: [[{ model: Meetup, as: 'meetup' }, 'date']],
    });
    return res.json(subscriptions);
  }
}

export default new SubscriptionController();
