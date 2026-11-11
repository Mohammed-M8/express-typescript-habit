import z from "zod"

const idSchema = z.uuid()


const parseId = (id: string | undefined) => {
    return idSchema.safeParse(id)
}

export { parseId }