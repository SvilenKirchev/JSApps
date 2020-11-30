import {getPartials, setHeaderInfo} from "./scripts/shared.js";
import {getLogin, getRegister, postLogin, postRegister, logout} from "./scripts/auth-handlers.js";
import {post, get, del, put} from "./scripts/requester.js";
import {displaySuccess} from "./scripts/shared.js";


const app = Sammy('body', function () {
    this.use('Handlebars', 'hbs');

    this.get('#/home', function (context) {
        setHeaderInfo(context);
        const partials = getPartials();
        this.loadPartials(partials)
            .partial('./views/home.hbs')
    });

    this.get('#/profile', function (context) {
        setHeaderInfo(context);
        this.loadPartials(getPartials())
            .partial('./views/profile.hbs')
    });

    this.get('#/login', getLogin);
    this.post('#/login', postLogin);

    this.get('#/register', getRegister);
    this.post('#/register', postRegister);

    this.get('#/logout', logout);

    this.get('#/create', function (context) {
        setHeaderInfo(context);
        this.loadPartials(getPartials())
            .partial('./views/offer/create.hbs');
    });
    this.post('#/create', function (context) {
        const {product, description, price, pictureUrl} = context.params;

        if (product && description && price && pictureUrl) {
            post('Kinvey', 'appdata', 'offers', {
                product,
                description,
                price,
                pictureUrl
            }).then(() => {
                context.redirect('#/home');
                displaySuccess("Your offer was created successfully!");
            }).catch(console.error);
        }
    });

    this.get('#/dashboard', function (context) {
        setHeaderInfo(context);
        get('Kinvey', 'appdata', 'offers')
            .then((offers) => {
                if (offers.length !== 0) {
                    context.offers = offers;
                    console.log(offers);
                    this.loadPartials(getPartials())
                        .partial('./views/offer/dashboard.hbs')
                } else {
                    context.offers = offers;
                    this.loadPartials(getPartials())
                        .partial('./views/offer/dashboardNoOffer.hbs')
                }
            })
    });

    this.get('#/details/:id', function (context) {
        const id = context.params.id;
        setHeaderInfo(context);
        get('Kinvey', 'appdata', `offers/${id}`)
            .then((offer) => {
                offer.isCreator = sessionStorage.getItem('userId') === offer._acl.creator;
                context.offer = offer;
                this.loadPartials(getPartials())
                    .partial('./views/offer/details.hbs')
            }).catch(console.log)
    });

    this.get('#/edit/:id', function (context) {
        const id = context.params.id;
        setHeaderInfo(context);

        get('Kinvey', 'appdata', `offers/${id}`)
            .then((offer) => {
                context.offer = offer;

                this.loadPartials(getPartials())
                    .partial('./views/offer/edit.hbs')
            })
    });
});

app.run('#/home');