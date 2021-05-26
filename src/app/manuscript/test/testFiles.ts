import { ManuscriptFile, Manuscript } from "../manuscript";

export var testFiles: ManuscriptFile[]= [
    // {
    //   name: 'Episode I - The Phantom Menace',
    //   url: 'https://upload.wikimedia.org/wikipedia/en/4/40/Star_Wars_Phantom_Menace_poster.jpg'
    // },
    // {
    //   name: 'Episode II - Attack of the Clones',
    //   url: 'https://upload.wikimedia.org/wikipedia/en/3/32/Star_Wars_-_Episode_II_Attack_of_the_Clones_%28movie_poster%29.jpg'
    // },
    // {
    //   name: 'Episode III - Revenge of the Sith',
    //   url: 'https://upload.wikimedia.org/wikipedia/en/9/93/Star_Wars_Episode_III_Revenge_of_the_Sith_poster.jpg'
    // },
    // {
    //   name: 'Episode IV - A New Hope',
    //   url: 'https://upload.wikimedia.org/wikipedia/en/8/87/StarWarsMoviePoster1977.jpg'
    // },
    // {
    //   name: 'Episode V - The Empire Strikes Back',
    //   url: 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg'
    // },
    // {
    //   name: 'Episode VI - Return of the Jedi',
    //   url: 'https://upload.wikimedia.org/wikipedia/en/b/b2/ReturnOfTheJediPoster1983.jpg'
    // },
    // {
    //   name: 'Episode VII - The Force Awakens',
    //   url: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Star_Wars_The_Force_Awakens_Theatrical_Poster.jpg'
    // },
    // {
    //   name: 'Episode VIII - The Last Jedi',
    //   url: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Star_Wars_The_Last_Jedi.jpg'
    // }
  ];

  export var testDB = ['A','B','C','D'].map((title, i)=> new Manuscript(title,'Author', new Date(), 'English', 'Description','Content', [], testFiles.slice(i)));