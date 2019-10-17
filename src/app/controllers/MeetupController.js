import * as Yup from 'yup';
import { parseISO, addDays } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import { Op } from 'sequelize';
import File from '../models/File';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const where = {};
    if (req.organizer) {
      where.user_id = req.userId;
    }

    if (req.query.date) {
      const date = parseISO(req.query.date, { locale: ptBr });
      where.date = { [Op.between]: [date, addDays(date, 1)] };
    }

    // const total = await Meetup.findAndCountAll({
    //   where,
    // });

    const meetups = await Meetup.findAndCountAll({
      where,
      attributes: ['id', 'title', 'description', 'address', 'date', 'past'],
      orderBy: ['date'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['url', 'path'],
        },
      ],
    });

    return res.set('X-TOTAL-COUNT', meetups.count).json(meetups.rows);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      address: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });
    if (!schema.isValid(req.body)) {
      return res.status(400).json({ error: 'Validation error' });
    }

    // verifica se a data ja passou
    const parsedDate = parseISO(req.body.date);
    if (parsedDate < new Date()) {
      return res
        .status(400)
        .json({ error: 'Não é possível criar eventos com datas passadas' });
    }

    const file = await File.findByPk(req.body.banner_id);
    if (!file) {
      return res.status(400).json({ error: 'Banner não encontrado' });
    }

    const titleExists = await Meetup.findOne({
      where: { title: req.body.title },
    });
    if (titleExists) {
      return res
        .status(400)
        .json({ error: 'Já existe evento com esse título' });
    }

    const meetup = await Meetup.create({ ...req.body, user_id: req.userId });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      address: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });
    if (!schema.isValid(req.body)) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const meetup = await Meetup.findByPk(req.params.meetupId);
    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    if (meetup.date < new Date()) {
      return res.status(404).json({ error: 'Esse evento já aconteceu' });
    }

    if (req.body.date && parseISO(req.body.date) < new Date()) {
      return res
        .status(404)
        .json({ error: 'A data não pode ser menor que a data atual' });
    }

    if (req.body.title != meetup.title) {
      const titleExists = await Meetup.findOne({
        where: { title: req.body.title },
      });
      if (titleExists) {
        return res
          .status(400)
          .json({ error: 'Já existe evento com esse título' });
      }
    }

    if (req.body.banner_id !== meetup.banner_id) {
      const fileExists = await File.findByPk(req.body.banner_id);
      if (!fileExists) {
        return res.status(400).json({ error: 'Banner não encontrado' });
      }
    }

    await meetup.update({ ...req.body, user_id: req.userId });

    return res.json(meetup);
  }

  async get(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['url', 'path', 'id'],
        },
      ],
    });

    if (!meetup) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId);

    if (!meetup) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (meetup.date < new Date()) {
      return res
        .status(400)
        .json({ error: 'Evento passado não pode ser excluído' });
    }

    // await meetup.destroy();

    return res.json({ msg: 'Evento excluído' });
  }
}

export default new MeetupController();
