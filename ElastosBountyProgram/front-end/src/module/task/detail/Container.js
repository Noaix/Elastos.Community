import {createContainer} from '@/util'
import Component from './Component'
import TeamService from '@/service/TeamService'
import TaskService from '@/service/TaskService'
import { message } from 'antd/lib/index'

export default createContainer(Component, (state) => {
    return {
        userId: state.user.current_user_id,
        is_login: state.user.is_login
    }
}, () => {

    const teamService = new TeamService()
    const taskService = new TaskService()

    return {
        async listTeamsOwned(userId) {

            try {
                const result = await teamService.list({
                    owner: userId
                })

                return result
            } catch (err) {
                console.error(err)
                message.error(err.message)
            }
        },

        async pushCandidate(taskId, userId, teamId, applyMsg) {

            try {
                const result = await taskService.pushCandidate(taskId, userId, teamId, applyMsg)

                return result
            } catch (err) {
                console.error(err)
                message.error(err.message)
            }

        }
    }
})
