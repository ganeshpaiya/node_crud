var express = require('express')
var app = express()


// SHOW LIST OF PRODUCTS

app.get('/', function(req, res, next) {

    if (req.session.page_views) {
        req.session.page_views++;
        // res.send("You visited this page " + req.session.page_views + " times");
    } else {
        req.session.page_views = 1;
        // res.send("Welcome to this page for the first time!");
    }


    req.getConnection(function(error, conn) {
        conn.query("select id,name,quantity,description from products order by id ASC", function(err, rows, fields) {
            if (err) {
                req.flash('error', err);
                res.render('product/list', {
                    title: 'Product List' + req.session.page_views,
                    data: ''
                })
            } else {
                res.render('product/list', {
                    title: 'Product List' + req.session.page_views,
                    data: rows
                })
            }
        })
    })
})

app.get('/add', function(req, res, next) {

    if (req.session.page_views) {
        req.session.page_views++;
        // res.send("You visited this page " + req.session.page_views + " times");
    } else {
        req.session.page_views = 1;
        // res.send("Welcome to this page for the first time!");
    }

    res.render('product/add', {
        title: 'Add New Product' + req.session.page_views,
        name: '',
        quantity: '',
        description: ''
    })
})

app.post('/add', function(req, res, next) {
    req.assert('name', 'Name is required').notEmpty()
    req.assert('quantity', 'Quantity is required').notEmpty()
    req.assert('quantity', 'Quantity should be numeric').isNumeric()
    req.assert('description', 'Description is required').notEmpty()

    var errors = req.validationErrors()
    if (!errors) {

        var product = {
            name: req.sanitize('name').escape().trim(),
            quantity: req.sanitize('quantity').escape().trim(),
            description: req.sanitize('description').escape().trim()
        }

        req.getConnection(function(error, conn) {
            conn.query('insert into products set ?', product, function(err, result) {
                if (err) {
                    req.flash('error', err)
                    res.render('product/add', {
                        title: 'Add New Product',
                        name: product.name,
                        quantity: product.quantity,
                        description: product.description
                    })
                } else {
                    console.log('success Data Added Successfully')
                    req.flash('success', 'Data Added Successfully')

                    res.render('product/add', {
                        title: 'Add New Product',
                        name: '',
                        quantity: '',
                        description: ''
                    })
                }
            })
        })
    } else {
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        res.render('product/add', {
            title: 'Add New Product',
            name: req.body.name,
            quantity: req.body.quantity,
            description: req.body.description
        })


    }
})

app.get('/edit/(:id)', function(req, res, next) {

    req.getConnection(function(error, conn) {
        console.log("select * from products where id=" + req.params.id)
        conn.query("select * from products where id=" + req.params.id, function(err, result, fields) {
            if (err) throw err
            if (result.length <= 0) {
                req.flash('error', 'no product found with the id' + req.params.id)
                res.redirect('/product');
            } else {
                res.render('product/edit', {
                    title: 'Edit Product',
                    id: result[0].id,
                    name: result[0].name,
                    quantity: result[0].quantity,
                    description: result[0].description
                })
            }
        })
    })
})



app.put('/edit/(:id)', function(req, res, next) {
    req.assert('name', 'Name is required').notEmpty()
    req.assert('quantity', 'Quantity is required').notEmpty()
    req.assert('quantity', 'Quantity should be numeric').isNumeric()
    req.assert('description', 'Description is required').notEmpty()

    var errors = req.validationErrors()
    if (!errors) {

        var product = {
            name: req.sanitize('name').escape().trim(),
            quantity: req.sanitize('quantity').escape().trim(),
            description: req.sanitize('description').escape().trim()
        }

        req.getConnection(function(error, conn) {
            conn.query('update products set ? where id=' + req.params.id, product, function(err, result) {
                if (err) {
                    req.flash('error', err)
                    res.render('product/edit', {
                        title: 'Edit Product',
                        name: product.name,
                        quantity: product.quantity,
                        description: product.description
                    })
                } else {

                    req.flash('success', 'Data Updated Successfully')
                    res.redirect('/product');
                    /*  res.render('product/edit', {
                          title: 'Edit Product',
                          id: req.params.id,
                          name: req.body.name,
                          quantity: req.body.quantity,
                          description: req.body.description
                      })*/
                }
            })
        })
    } else {
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        res.render('product/edit', {
            title: 'Edit Product',
            id: req.params.id,
            name: req.body.name,
            quantity: req.body.quantity,
            description: req.body.description
        })


    }
})


app.delete('/delete/(:id)', function(req, res, next) {
    var product = { id: req.params.id }
    req.getConnection(function(error, conn) {
        conn.query("delete from products where id=" + req.params.id, product, function(err, result) {
            if (err) {
                req.flash('error', err)
                res.redirect('/product')
            } else {
                req.flash('success', 'Product Deleted Successfully! id=' + req.params.id)
                res.redirect('/product')
            }
        })
    })
})

module.exports = app