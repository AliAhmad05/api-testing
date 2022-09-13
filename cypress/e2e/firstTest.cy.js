/// <reference types="cypress" />

describe('Backend Testing', () => {

    beforeEach('Login to App', () => {
        cy.intercept('GET', 'https://api.realworld.io/api/tags', { fixtures: 'tags.json' })
        cy.loginToApplication()
    })

    // it('Should log In',()=>{
    //     cy.log('We logged in Finally!!')
    // })

    it('Verify correct request and response', () => {

        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('PostArticles')


        cy.contains(' New Article ').click()
        cy.get('[formcontrolname="title"]').type('This is the title')
        cy.get('[formcontrolname="description"]').type('This is the description')
        cy.get('[formcontrolname="body"]').type('This is the article')
        cy.get('[placeholder="Enter tags"]').type('ApeX')
        //cy.get('[type="button"]').click()
        cy.contains(' Publish Article ').click()

        cy.wait('@PostArticles').then(xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is the article')
            expect(xhr.response.body.article.description).to.equal('This is the description')
        })


    })

    it.only('Verify tags on the dashboard', () => {
        cy.log('We are logged in')
    })
})