// Create a post schema that contains these fields: name, title, email, comment, post
export default {
    name: 'comment',
    type: 'document',
    title: 'Comment',
    fields: [
        {
            name: 'name',
            type: 'string',
        },
        {
            title: 'Approved',
            name: 'approved',
            type: 'boolean',
            description: "Comments won't show on the site without approval",
        },
        {
            name: 'email',
            type: 'string',
        },
        {
            name: 'comment',
            type: 'text',
        },
        {
            name: 'post',
            type: 'reference',
            to: [{type: 'post'}],
        }
    ],
}