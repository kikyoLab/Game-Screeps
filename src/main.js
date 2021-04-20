<<<<<<< HEAD
import { errorMapper } from './modules/errorMapper'

export const loop = errorMapper(() => {

=======
import { sayHello } from './modules/utils'
import { errorMapper } from './modules/errorMapper'

export const loop = errorMapper(() => {
    sayHello()
>>>>>>> 8cb3f662682ca88441a85348890af0f8d0a37bab
})