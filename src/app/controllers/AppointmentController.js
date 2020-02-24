import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import User from '../models/User';
import Appointment from '../models/Appointment';

class AppointmentController {
    async store(req, res) {
        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date: Yup.date().required()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { provider_id, date } = req.body;

        // Checar se o usuário é um provier
        const checkIsProvider = await User.findOne({
            where: {
                id: provider_id,
                provider: true
            }
        });

        if (!checkIsProvider) {
            return res.status(401).json({
                error: 'You can only create appointments with providers'
            });
        }

        // Checagem para agendamentos de horas não permitidas (anteriores)
        const hourStart = startOfHour(parseISO(date));

        if (isBefore(hourStart, new Date())) {
            return res
                .status(400)
                .json({ error: 'Past dates are not permitted' });
        }

        // Checar disponibilidade da data para criação de agendamentos
        const checkAvailability = await Appointment.findOne({
            where: {
                provider_id,
                cancelled_at: null,
                date: hourStart
            }
        });

        if (checkAvailability) {
            return res
                .status(400)
                .json({ error: 'Appointment date is not available' });
        }

        // Criação do agendamento
        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date
        });

        return res.json(appointment);
    }
}

export default new AppointmentController();
