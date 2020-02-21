import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                email: Sequelize.STRING,
                password: Sequelize.VIRTUAL,
                password_hash: Sequelize.STRING,
                provider: Sequelize.BOOLEAN
            },
            {
                sequelize
            }
        );

        // Criptografar a senha inserida antes de salvar
        this.addHook('beforeSave', async user => {
            if (user.password) {
                user.password_hash = await bcrypt.hash(user.password, 8);
            }
        });

        return this;
    }

    // Relacionando com o model File
    static associate(models) {
        this.belongsTo(models.File, {
            foreignKey: 'avatar_id',
            as: 'avatar'
        });
    }

    // Método para comparar senha armanzenada com senha inserida
    checkPassword(password) {
        return bcrypt.compare(password, this.password_hash);
    }
}

export default User;
