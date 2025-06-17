const setTitle = (title: string) => {
    return title ? `${title} | L3-AL - Espace Admin  : Plateforme de suivi scolaire` : 'L3-AL - Espace Admin : Plateforme de suivi scolaire';
};

const authRoutes = [
    {
        path: '/auth/change_password',
        name: 'auth.change_password',
        meta: {
            title: setTitle('Modification du mot de passe'),
            authRequired: false
        },
        component: () => import('@/views/auth/change_password.vue')
    },
    {
        path: '/auth/sign-in',
        name: 'auth.sign-in',
        meta: {
            title: setTitle('Se connecter')
        },
        component: () => import('@/views/auth/sign-in.vue')
    },
    {
        path: '/auth/password_update',
        name: 'auth.password_update',
        meta: {
            title: setTitle('Confirmation du mot de passe'),
            authRequired: false
        },
        component: () => import('@/views/auth/password_update.vue')
    },
    
    {
        path: '/auth/reset-password',
        name: 'auth.reset-password',
        meta: {
            title: setTitle('Reset Password')
        },
        component: () => import('@/views/auth/reset-password.vue')
    },
    
];

const errorRoutes = [
    {
        path: '/404',
        name: 'error.404',
        meta: {
            title: setTitle('Error 404')
        },
        component: () => import('@/views/pages/error-404.vue')
    },
    {
        path: '/404-alt',
        name: 'error.404-alt',
        meta: {
            title: setTitle('Error 404 Alt')
        },
        component: () => import('@/views/pages/error-404-alt.vue')
    },
    {
        path: '/:catchAll(.*)',
        redirect: '404'
    }
];

const dashboardRoutes = [
    {
        path: '/',
        name: 'dashboards.index',
        meta: {
            title: setTitle('Dashboard'),
            authRequired: true,
            breadcrumb: [
                { text: 'Tableau de bord' }
            ]
        },
        component: () => import('@/views/dashboards/index.vue'),
    },
    {
        path: '/evaluation',
        name: 'commanditaire.index',
        meta: {
            title: setTitle('Listes des evalutions'),
            authRequired: true,
            breadcrumb: [
                { text: 'Listes des evalutions' }
            ]
        },
        component: () => import('@/views/commanditaire/index.vue'),
       
    },
    {
        path: '/commanditaire/:id/campagnes',  // :id est un paramètre dynamique
        name: 'commanditaire-campagnes',
        meta: {
            title: setTitle('Détails des campagnes'),
            authRequired: true,
            breadcrumb: [
                { text: 'Commanditaires', to: '/commanditaire' },
                { text: 'Campagnes', dynamic: 'id' },
              ],
        },
        component: () => import('@/views/commanditaire/detailCampagne.vue')
    },
    {
        path: '/commanditaire/:id/campagnes/:campagnesId/programmes',  // :id est un paramètre dynamique
        name: 'campagnes-programmes',
        meta: {
            title: setTitle('Détails des programmes'),
            authRequired: true,
            breadcrumb: [
                { text: 'Commanditaires', to: '/commanditaire' },
                { text: 'Campagnes', dynamic: 'id' },
                { text: 'Programmes', dynamic: 'campagneId' },
              ]
        },
        component: () => import('@/views/commanditaire/detailProgramme.vue')
    },
    {
        path: '/utilisateur',
        name: 'utilisateur.index',
        meta: {
            title: setTitle('Gestion des utilisateurs'),
            authRequired: true,
            breadcrumb: [
                { text: 'Gestion des utilisateurs' }
            ]
        },
        component: () => import('@/views/utilisateur/index.vue'),
    },
    {
        path: '/campagne',
        name: 'campagne.index',
        meta: {
            title: setTitle('Gestion des campagnes'),
            authRequired: true,
            breadcrumb: [
                { text: 'Campagnes' }
            ]
        },
        component: () => import('@/views/campagne/index.vue'),
    },
    {
        path: '/classe',
        name: 'classe.index',
        meta: {
            title: setTitle('Gestion des classes'),
            authRequired: true,
            breadcrumb: [
                { text: 'Gestion des classes' }
            ]
        },
        component: () => import('@/views/classe/index.vue'),
    },
    {
        path: '/inscription',
        name: 'inscription.index',
        meta: {
            title: setTitle('Gestion des Inscriptions'),
            authRequired: true,
            breadcrumb: [
                { text: 'Gestion des Inscriptions' }
            ]
        },
        component: () => import('@/views/inscription/index.vue'),
    },
    {
        path: '/seance',
        name: 'seance.index',
        meta: {
            title: setTitle('Gestion des séances'),
            authRequired: true,
            breadcrumb: [
                { text: 'Gestions des séances' }
            ]
        },
        component: () => import('@/views/seance/index.vue'),
    },
    {
        path: '/annonce',
        name: 'annonce.index',
        meta: {
            title: setTitle('Gestions des Annonces'),
            authRequired: true,
            breadcrumb: [
                { text: 'Gestions des Annonces' }
            ]
        },
        component: () => import('@/views/annonce/index.vue'),
    },
    {
        path: '/spot',
        name: 'spot.index',
        meta: {
            title: setTitle('Gestion des spots'),
            authRequired: true,
            breadcrumb: [
                { text: 'Spots' }
            ]
        },
        component: () => import('@/views/spot/index.vue'),
    },
    {
        path: '/matiere',
        name: 'matiere.index',
        meta: {
            title: setTitle('Gestion des matières'),
            authRequired: true,
            breadcrumb: [
                { text: 'Matières' }
            ]
        },
        component: () => import('@/views/matiere/index.vue'),
    },
   
];

 

export const allRoutes = [...dashboardRoutes,  ...errorRoutes, ...authRoutes];
