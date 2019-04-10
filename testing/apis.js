const { query } = require("../");

async function test_books({fields, url}) {
    const rtn = await query({
        query : `
            query {
                test_books {
                    ${fields}
                }
            }
        `,
        url
    });

    return rtn.test_books;
}

async function test_books_update({fields, variables, url}) {
    const rtn = await query({
        query : `
            mutation($input : test_update_book!) {
                test_books_update(input: $input) {
                    ${fields}
                }
            }
        `,
        variables,
        url
    });

    return rtn.test_books_update;
}

async function test_reset({fields, url}) {
    const rtn = await query({
        query : `
            mutation {
                test_reset {
                    ${fields}
                }
            }
        `,
        url
    });

    return rtn.test_reset;
}

module.exports = {
    test_books,
    test_reset,
    test_books_update
};