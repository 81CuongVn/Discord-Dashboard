export const router: (props: any)=>void = (props: { fastify: any, discordClient: any, categories: any }) => {
    props.fastify.register((instance: any, opts: any, next: any)=>{
        instance.get('/:guild_id/settings', async (request: any, reply: any) => {
            const member_id = request.session?.user?.id
            if(!member_id) return reply.code(401).send({ error: 'You are not logged in' })
            const guild = props.discordClient.guilds.cache.get(request.params.guild_id)
            const member = guild.members.cache.get(member_id)

            //if(!member.hasPermissions('MANAGE_GUILD')) return reply.code(403).send({ error: 'You do not have permission to manage this guild' })

            let return_categories: any = [];

            for(const category of props.categories) {
                return_categories.push({
                    name: category.name,
                    id: category.id,
                    options: []
                })
                for(const option of category.options){
                    // If should be displayed for user on guild (this one doesn't display option at all)
                    if(option.shouldBeDisplayed){
                        const display = await option.shouldBeDisplayed({ member, guild })
                        if(display == false) continue
                    }

                    // If should be disabled for user on guild (this one displays error and blocks option if not met)
                    if(option.type?.disabled?.bool == true) {
                        // If is globally disabled with option type
                        option.allowed = false
                        option.reason = option.type.disabled.reason
                    }else{
                        // If is disabled for user with prePermissionsCheck
                        if(option.permissionsValidate){
                            const permissionsValidate = await option.permissionsValidate({ member, guild })
                            if(permissionsValidate) {
                                option.allowed = false
                                option.reason = permissionsValidate
                            }
                        }
                    }

                    // Get actual value
                    option.value = await option.get({ member, guild })
                    if(option.value == null)option.value = option.type.defaultValue

                    // Delete unnecessary properties
                    delete option.type.disabled
                    delete option.type.defaultValue

                    // Add to return
                    return_categories[return_categories.length-1].options.push(JSON.parse(JSON.stringify(option)))
                }
            }

            return reply.send(return_categories)
        })

        instance.post('/settings', async (request: any, reply: any) => {
            const { settings } = request.body
            const errored_messages: object[] = []
            for(const category_body of settings){
                const categoryData = props.categories.find((e:any)=>e.id === category_body.id)
                for(const option_body of category_body.options){
                    const optionData = categoryData.options.find((e:any)=>e.id === option_body.id)

                    //  TEST: If should be disabled for user on guild (this one displays error and blocks option if not met)
                    if(optionData.type?.disabled?.bool == true) {
                        //  TEST: If is globally disabled with option type
                        errored_messages.push({
                            category: categoryData.id,
                            option: optionData.id,
                            error: optionData.type?.disabled.reason
                        })
                        continue
                    }

                    // TEST: If should be displayed for user on guild
                    if(optionData.shouldBeDisplayed){
                        const display = await optionData.shouldBeDisplayed({  })
                        if(display == false) continue
                    }

                    //  TEST: If is disabled for user with prePermissionsCheck
                    if(optionData.permissionsValidate){
                        const permissionsValidate = await optionData.permissionsValidate({  })
                        if(permissionsValidate) {
                            errored_messages.push({
                                category: categoryData.id,
                                option: optionData.id,
                                error: permissionsValidate
                            })
                            continue
                        }
                    }

                    // ServerSide Validation
                    const validated_error = await optionData.serverSideValidation({newData:option_body.newData})
                    if(validated_error){
                        errored_messages.push({
                            category: categoryData.id,
                            option: optionData.id,
                            error: validated_error
                        })
                        continue
                    }

                    // All test passed, set new value
                    await optionData.set({newData: option_body.newData})
                }
            }
            return reply.send({error:false,errored_messages})
        })

        next()
    }, { prefix: '/api/guild' })
}