import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async index(req, res) {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'organizer'],
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
      organizer: Yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists) {
      return res.status(400).json({ error: 'E-mail already exists' });
    }
    const { id, name, email, organizer } = await User.create(req.body);
    res.json({ id, name, email, organizer });
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

    if (
      req.body.oldPassword &&
      req.body.password !== req.body.passwordConfirmation
    ) {
      return res
        .status(400)
        .json({ error: "New password didn't match with confirmation" });
    }

    if (req.body.organizer) delete req.body.organizer;
    const { id, name, email, organizer } = await user.update(req.body);

    res.json({ id, name, email, organizer });
  }
}

export default new UserController();
