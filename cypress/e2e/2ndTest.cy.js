/// <reference types="cypress" />

describe('Backend Testing', () => {

    beforeEach('Login to App', () => {
        cy.intercept('GET', 'https://api.realworld.io/api/tags', { fixture: 'tags.json' })
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

    it('Verify tags on the dashboard', () => {
        //cy.log('We are logged in')
        cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'testing')
            .and('contain', 'codebaseShow')
    })

    it('verify global feed likes', () => {
        cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', { "articles": [], "articlesCount": 0 })
        cy.intercept('GET', 'https://api.realworld.io/api/articles*', { fixture: 'articles.json' })
        cy.contains('Global Feed').click()
        cy.get('app-article-list button').then(heartList => {
            expect(heartList[0]).to.contain('555')
            expect(heartList[1]).to.contain('1605')
        })
        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
            file.articles[1].favoritesCount = 66
            cy.intercept('POST', 'https://api.realworld.io/api/articles/' + articleLink + '/favorite', file)
        })

        cy.get('app-article-list button').eq(1).click().should('contain','6')
    })
})

describe('Test with backend', () => {
    beforeEach('Login to the App', () => {
        cy.intercept({ method: 'Get', path: 'tags' }, { fixture: 'tags.json' })
        cy.loginToApplication()
    })

    it('Verify tags on the dashboard', () => {
        cy.log('We are logged in')
        cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'testing')
            .and('contain', 'codebaseShow')
    })

    it('Delete a new article',()=>{

        const bodyRequest = {
            "article": {
                "tagList": [],
                "title": "Request from API",
                "description": "ali",
                "body": "ali"
            }
        }

        cy.get('@token').then(token=>{

            cy.request({
                url: 'https://conduit.productionready.io/api/articles',
                headers:{'Authorization':'Token '+token},
                method: 'POST',
                body: bodyRequest
            }).then(response=>{
                expect(response.status).to.equal(200)
            })

            cy.contains('Global Feed').click()
            cy.get('.article-preview').first().click()
            cy.get('.article-actions').contains('Delete Article').click()
            
            cy.request({
                url:'https://conduit.productionready.io/api/articles?limit=10&offset=0',
                headers:{'Authorization':'Token '+token},
                method:'GET'
            }).its('body').then(body=>{
                //console.log(body)
                expect(body.articles[0].title).not.to.equal('Request from API')
            })
        })
    })
})