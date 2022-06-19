import { DataTypes } from 'sequelize'

export default async ({ sequelize }) => {
    sequelize.define('User', {
        userId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                len: [2, 50],
                isAlphanumeric: true
            }
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        userImg: {
            type: DataTypes.STRING,
            allowNull: false
        },

        socketId: {
            type: DataTypes.STRING,
        }
    }, {
        created_at: 'createdAt',
        updated_at: 'updatedAt',
        underscored: true,
        tableName: 'users'
    })
}