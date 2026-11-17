import type { OfficialClubSquad } from './applyOfficialSquads';

/** Current first-team player names transcribed from the clubs' official squad pages. */
export const AFRICAN_CLUB_SQUADS_2026:OfficialClubSquad[] = [
  {
    clubId:'cairo_eagles', clubName:'Al Ahly SC',
    players:[
      {name:'Mohamed El Shenawy'},{name:'Yasser Ibrahim'},{name:'Ahmed Nabil Koka'},{name:'Emam Ashour'},{name:'Hussien El Shahat'},
      {name:'Marawan Attia'},{name:'Mohamed Hany'},{name:'Taher Mohamed Taher'},{name:'Achraf Dari'},{name:'Achraf Bencharki'},
      {name:'Mostafa Shobeir'},{name:'Yassin Marei'},{name:'Ahmed El Sayed Zizo'},{name:'Karim Fouad'},{name:'Ahmed Eid'},
      {name:'Amr El Gazar'},{name:'Youssef Belammari'},{name:'Hady Reyad'},{name:'Mounsef Bakrar'},{name:'Soufiane Benjdida'},
      {name:'Hamza Alaa'},{name:'Omar El Saaiy'},{name:'Ali Mahmoud'},{name:'Tawfik Mohamed'},{name:'Kabaka'},
      {name:'Omar Moawad'},{name:'Mohamed Abdallah'},{name:'Karim El Debes'},{name:'Akram Tawfik'},{name:'Aqtay Abdallah'},
    ],
  },
  {
    clubId:'tunis_esperance', clubName:'Espérance Sportive de Tunis',
    players:[
      {name:'Bechir Ben Saïd',shirtNumber:32},{name:'Mohamed Sedki Debchi',shirtNumber:26},{name:'Amanallah Memmiche',shirtNumber:1},
      {name:'Ibrahim Ben Sghaier'},{name:'Mokhtar Ifaoui',shirtNumber:16},{name:'Mohamed Ben Ali',shirtNumber:2},
      {name:'Mohamed Amine Ben Hamida',shirtNumber:20},{name:'Aymen Ben Mohamed',shirtNumber:22},{name:'Raed Bouchniba',shirtNumber:13},
      {name:'Hamza Jlassi',shirtNumber:6},{name:'Yassine Meriah',shirtNumber:5},{name:'Mohamed Amine Tougai',shirtNumber:15},
      {name:'Roger Aholou',shirtNumber:18},{name:'Mohamed Wael Derbali',shirtNumber:4},{name:'Zakaria El Ayeb',shirtNumber:17},
      {name:'Khalil Guennichi',shirtNumber:27},{name:'Onuche Ogbelu',shirtNumber:14},{name:'Houssem Tka'},
      {name:'Yan Sasse',shirtNumber:10},{name:'Youssef Belaïli',shirtNumber:11},{name:'Aboubaker Diakité',shirtNumber:29},
      {name:'Achref Jabri',shirtNumber:19},{name:'Chiheb Jebali',shirtNumber:31},{name:'Zinedine Kada',shirtNumber:28},
      {name:'Koussay Maacha',shirtNumber:30},{name:'Mohamed Mouhli',shirtNumber:33},{name:'Elias Mokwana',shirtNumber:24},
      {name:'Rodrigo Rodrigues',shirtNumber:9},{name:'Aziz Koudhai',shirtNumber:35},{name:'Rayane Hamrouni',shirtNumber:7},
      {name:'Abderahman Konate'},{name:'Ilyess Bouzaiene',shirtNumber:25},
    ],
  },
  {
    clubId:'enyimba_elephants', clubName:'Enyimba FC',
    players:[
      {name:'Mujeep Adefeso'},{name:'Asibe Nathaniel',shirtNumber:1},{name:'Odinaka Obi',shirtNumber:2},
      {name:'Alade Balogun',shirtNumber:3},{name:'Moses Adiukwu',shirtNumber:4},{name:'Nwaodu Chukwudi',shirtNumber:8},
      {name:'Abdulwasu Jimuo',shirtNumber:9},{name:'Bernard Ovoke',shirtNumber:11},{name:'Zari Abdullah',shirtNumber:12},
      {name:'P Eze',shirtNumber:18},{name:'Obinna Leonard',shirtNumber:19},{name:'Chigozie Ani',shirtNumber:21},
      {name:'Ufere Chinedu',shirtNumber:22},{name:'Eze Pinto',shirtNumber:27},{name:'Siriki Siriki'},
      {name:'Ukadike Divine',shirtNumber:28},{name:'Imoh Obot',shirtNumber:29},{name:'Awazie E',shirtNumber:30},
      {name:'Ifeanyi Chukwueme',shirtNumber:31},{name:'Jephtha Clinton',shirtNumber:33},{name:'Henry Ozoemena',shirtNumber:35},
      {name:'David Ekele',shirtNumber:39},
    ],
  },
];

export const AFRICAN_SQUAD_SOURCES = {
  snapshot:'2026-11-17',
  alAhly:'https://www.alahlyegypt.com/en/football/first-team',
  esperance:'https://www.est.org.tn/fr/equipe-pro',
  enyimba:'https://enyimbafc.net/first-team/',
} as const;
