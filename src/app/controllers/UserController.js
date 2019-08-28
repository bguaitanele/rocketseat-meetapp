import User from '../models/User';
import * as Yup from 'yup';
import { updateLocale } from 'moment';
class UserController {
  async index(req, res) {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
    });
    res.json(users);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists) {
      return res.status(400).json({ error: 'E-mail already exists' });
    }
    const { id, name, email } = await User.create(req.body);
    res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      passwordConfirmation: Yup.string().when(
        'password',
        (password, confirmation) =>
          password
            ? confirmation.required().oneOf([Yup.ref('password')])
            : confirmation
      ),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(400).json({ error: 'user not found' });
    }

    if (req.body.email && user.email != req.body.email) {
      const userExists = await User.findOne({
        where: { email: req.body.email },
      });
      if (userExists) {
        return res.status(400).json({ error: 'E-mail already exists' });
      }
    }

    if (
      req.body.oldPassword &&
      !(await user.checkPassword(req.body.oldPassword))
    ) {
      return res.status(400).json({ error: 'Wrong password' });
    }

    const { id, name, email } = await user.update(req.body);

    res.json({ id, name, email });
  }
}

export default new UserController();
