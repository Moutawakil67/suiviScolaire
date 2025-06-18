import type { MenuItemType } from '@/types/menu';

export const MENU_ITEMS: MenuItemType[] = [
    {
        key: 'menu',
        label: 'MENU',
        isTitle: true,
    },
    {
        key: 'dashboard',
        icon: 'solar:home-2-broken',
        label: 'Dashboard',
        // badge: {
        //     text: '9+',
        //     variant: 'success',
        // },
        route: { name: 'dashboards.index' },
    },
    {
        key: 'utilisateur',
        icon: 'solar:users-group-rounded-broken',
        label: 'Utilisateurs',
        route: { name: 'utilisateur.index' },
    },
    {
        key: 'classe',
        icon: 'solar:play-stream-broken',
        label: 'Classes',
        route: { name: 'classe.index' },
    },

    {
        key: 'inscription',
        icon: 'solar:bookmark-circle-bold-duotone',
        label: 'Inscriptions',
        route: { name: 'inscription.index' },
    },
    {
        key: 'matiere',
        icon: 'solar:folder-with-files-broken',
        label: 'Matières',
        route: { name: 'matiere.index' },
    },
    {
        key: 'seance',
        icon: 'solar:flame-bold-duotone',
        label: 'Séances',
        route: { name: 'seance.index' },
    },
    {
        key: 'evaluation',
        icon: 'fluent-mdl2:edit-note',
        label: 'Evaluations',
        route: { name: 'evaluation.index' },
    },
    {
        key: 'bulletin',
        icon: 'solar:bill-list-broken',
        label: 'Bulletin de notes',
        route: { name: 'bulletin.index' },
    }, 
    {
        key: 'annonce',
        icon: 'solar:confetti-minimalistic-line-duotone',
        label: 'Annonces',
        route: { name: 'annonce.index'},
    },
    // {
    //     key: 'spot',
    //     icon: 'solar:play-circle-broken',
    //     label: 'Spots',
    //     route: { name: 'spot.index' },
    // },
    
   
    // {
    //     key: 'programme',
    //     icon: 'solar:users-group-rounded-broken',
    //     label: 'Programme',
    //     route: { name: 'programme.index' },
    // },
   
];
