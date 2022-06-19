import { DataTypes } from 'sequelize'

export default async ({ sequelize }) => {
    await sequelize.define('Message', {
        messageId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        messageBody: {
            type: DataTypes.STRING,
            allowNull: false
        },

        messageType: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        created_at: 'createdAt',
        updated_at: 'updatedAt',
        underscored: true,
        tableName: 'messages'
    })

    await sequelize.models.User.hasMany(sequelize.models.Message, {
        foreignKey: 'messageFrom',
    })

    await sequelize.models.User.hasMany(sequelize.models.Message, {
        foreignKey: 'messageTo',
    })

    await sequelize.models.Message.belongsTo(sequelize.models.User, {
        foreignKey: 'messageFrom',
    })

    await sequelize.models.Message.belongsTo(sequelize.models.User, {
        foreignKey: 'messageTo',
    })
}