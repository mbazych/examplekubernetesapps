let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(require('chai-fuzzy'))
let server = "localhost:8080"
chai.use(chaiHttp);


describe('/postgres-item test', () => {

    // GET all items
    describe('GET all items', () => {
        it('it should GET all items', (done) => {
            chai.request(server)
                .get('/postgres-item')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                done();
                });
        })
    })

    // create postgres-item
    describe('POST /postgres-item create item', () => {
        it('it should POST new item', (done) => {
            let req = {
                "title": "Simple postgres item",
                "content": "Simple postgres content"
            }

            chai.request(server)
                .post('/postgres-item')
                .set('Content-Type', 'application/json')
                .send(req)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object')
                    .that.has.all.keys([
                        'title', 
                        'content'
                    ])
                    done()
                })


        })
    })
})
