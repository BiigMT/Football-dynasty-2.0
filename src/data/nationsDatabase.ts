export type Confederation = 'CAF' | 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'OFC';
export interface NationEntry { code:string; name:string; confederation:Confederation; primaryKitColor:string; secondaryKitColor:string; flagColors:[string,string,string]; worldRanking:number; u21OvrRequired:number; seniorOvrRequired:number; localAcademies:string[]; }
export const NATIONS_DATABASE: NationEntry[] = [
  {
    "code": "ZAM",
    "name": "Zambia",
    "confederation": "CAF",
    "primaryKitColor": "#D71920",
    "secondaryKitColor": "#198A00",
    "flagColors": [
      "#D71920",
      "#198A00",
      "#FFFFFF"
    ],
    "worldRanking": 41,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "ZESCO United Youth",
      "Zanaco Academy",
      "Power Dynamos Academy"
    ]
  },
  {
    "code": "NGA",
    "name": "Nigeria",
    "confederation": "CAF",
    "primaryKitColor": "#008751",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#008751",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 38,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Enyimba Academy",
      "Lagos Pro Academy",
      "Right to Dream Nigeria"
    ]
  },
  {
    "code": "GHA",
    "name": "Ghana",
    "confederation": "CAF",
    "primaryKitColor": "#FCD116",
    "secondaryKitColor": "#006B3F",
    "flagColors": [
      "#FCD116",
      "#006B3F",
      "#FFFFFF"
    ],
    "worldRanking": 52,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Right to Dream",
      "WAFU Academy",
      "Hearts of Oak Youth"
    ]
  },
  {
    "code": "RSA",
    "name": "South Africa",
    "confederation": "CAF",
    "primaryKitColor": "#007749",
    "secondaryKitColor": "#FFB81C",
    "flagColors": [
      "#007749",
      "#FFB81C",
      "#FFFFFF"
    ],
    "worldRanking": 59,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Kaizer Chiefs Youth",
      "Mamelodi Sundowns Academy",
      "Orlando Pirates Academy"
    ]
  },
  {
    "code": "MAR",
    "name": "Morocco",
    "confederation": "CAF",
    "primaryKitColor": "#C1272D",
    "secondaryKitColor": "#006233",
    "flagColors": [
      "#C1272D",
      "#006233",
      "#FFFFFF"
    ],
    "worldRanking": 14,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Mohammed VI Academy",
      "FUS Rabat Academy",
      "Wydad Youth"
    ]
  },
  {
    "code": "EGY",
    "name": "Egypt",
    "confederation": "CAF",
    "primaryKitColor": "#CE1126",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#CE1126",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 36,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Al Ahly Academy",
      "Zamalek Youth",
      "Future FC Academy"
    ]
  },
  {
    "code": "SEN",
    "name": "Senegal",
    "confederation": "CAF",
    "primaryKitColor": "#00853F",
    "secondaryKitColor": "#FDEF42",
    "flagColors": [
      "#00853F",
      "#FDEF42",
      "#FFFFFF"
    ],
    "worldRanking": 17,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Génération Foot",
      "Diambars Academy",
      "ASC Jaraaf Youth"
    ]
  },
  {
    "code": "CIV",
    "name": "Ivory Coast",
    "confederation": "CAF",
    "primaryKitColor": "#F77F00",
    "secondaryKitColor": "#009E60",
    "flagColors": [
      "#F77F00",
      "#009E60",
      "#FFFFFF"
    ],
    "worldRanking": 42,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "ASEC Mimosas Academy",
      "FC San Pedro Youth",
      "Africa Sports Academy"
    ]
  },
  {
    "code": "CMR",
    "name": "Cameroon",
    "confederation": "CAF",
    "primaryKitColor": "#007A5E",
    "secondaryKitColor": "#CE1126",
    "flagColors": [
      "#007A5E",
      "#CE1126",
      "#FFFFFF"
    ],
    "worldRanking": 49,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Kadji Sports Academy",
      "Brasseries du Cameroun",
      "Canon Yaoundé Youth"
    ]
  },
  {
    "code": "ALG",
    "name": "Algeria",
    "confederation": "CAF",
    "primaryKitColor": "#006233",
    "secondaryKitColor": "#D21034",
    "flagColors": [
      "#006233",
      "#D21034",
      "#FFFFFF"
    ],
    "worldRanking": 37,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Paradou AC Academy",
      "JS Kabylie Youth",
      "USM Alger Academy"
    ]
  },
  {
    "code": "TUN",
    "name": "Tunisia",
    "confederation": "CAF",
    "primaryKitColor": "#E70013",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#E70013",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 40,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Étoile du Sahel Academy",
      "Esperance Youth",
      "Club Africain Academy"
    ]
  },
  {
    "code": "MLI",
    "name": "Mali",
    "confederation": "CAF",
    "primaryKitColor": "#14B53A",
    "secondaryKitColor": "#FCD116",
    "flagColors": [
      "#14B53A",
      "#FCD116",
      "#FFFFFF"
    ],
    "worldRanking": 54,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "JMG Academy Bamako",
      "Stade Malien Youth",
      "Djoliba Academy"
    ]
  },
  {
    "code": "COD",
    "name": "DR Congo",
    "confederation": "CAF",
    "primaryKitColor": "#007FFF",
    "secondaryKitColor": "#F7D618",
    "flagColors": [
      "#007FFF",
      "#F7D618",
      "#FFFFFF"
    ],
    "worldRanking": 61,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "TP Mazembe Academy",
      "AS Vita Club Youth",
      "DCMP Academy"
    ]
  },
  {
    "code": "KEN",
    "name": "Kenya",
    "confederation": "CAF",
    "primaryKitColor": "#006600",
    "secondaryKitColor": "#BB0000",
    "flagColors": [
      "#006600",
      "#BB0000",
      "#FFFFFF"
    ],
    "worldRanking": 102,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "AFC Leopards Youth",
      "Gor Mahia Academy",
      "Tusker Youth"
    ]
  },
  {
    "code": "TAN",
    "name": "Tanzania",
    "confederation": "CAF",
    "primaryKitColor": "#1EB53A",
    "secondaryKitColor": "#00A3DD",
    "flagColors": [
      "#1EB53A",
      "#00A3DD",
      "#FFFFFF"
    ],
    "worldRanking": 112,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Simba SC Academy",
      "Young Africans Youth",
      "Azam FC Academy"
    ]
  },
  {
    "code": "UGA",
    "name": "Uganda",
    "confederation": "CAF",
    "primaryKitColor": "#FCDC04",
    "secondaryKitColor": "#D90000",
    "flagColors": [
      "#FCDC04",
      "#D90000",
      "#FFFFFF"
    ],
    "worldRanking": 88,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Vipers SC Academy",
      "KCCA Youth",
      "Express FC Academy"
    ]
  },
  {
    "code": "ZIM",
    "name": "Zimbabwe",
    "confederation": "CAF",
    "primaryKitColor": "#319208",
    "secondaryKitColor": "#D40000",
    "flagColors": [
      "#319208",
      "#D40000",
      "#FFFFFF"
    ],
    "worldRanking": 124,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Highlanders Academy",
      "Dynamos Youth",
      "Ngezi Platinum Academy"
    ]
  },
  {
    "code": "ANG",
    "name": "Angola",
    "confederation": "CAF",
    "primaryKitColor": "#CC092F",
    "secondaryKitColor": "#000000",
    "flagColors": [
      "#CC092F",
      "#000000",
      "#FFFFFF"
    ],
    "worldRanking": 93,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Petro de Luanda Academy",
      "1º de Agosto Youth",
      "Interclube Academy"
    ]
  },
  {
    "code": "BFA",
    "name": "Burkina Faso",
    "confederation": "CAF",
    "primaryKitColor": "#EF2B2D",
    "secondaryKitColor": "#009E49",
    "flagColors": [
      "#EF2B2D",
      "#009E49",
      "#FFFFFF"
    ],
    "worldRanking": 62,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Rahimo FC Academy",
      "ASFA Yennenga Youth",
      "Salitas Academy"
    ]
  },
  {
    "code": "GUI",
    "name": "Guinea",
    "confederation": "CAF",
    "primaryKitColor": "#CE1126",
    "secondaryKitColor": "#FCD116",
    "flagColors": [
      "#CE1126",
      "#FCD116",
      "#FFFFFF"
    ],
    "worldRanking": 76,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Horoya AC Academy",
      "Hafia FC Youth",
      "Soar Academy"
    ]
  },
  {
    "code": "GAB",
    "name": "Gabon",
    "confederation": "CAF",
    "primaryKitColor": "#009E60",
    "secondaryKitColor": "#FCD116",
    "flagColors": [
      "#009E60",
      "#FCD116",
      "#FFFFFF"
    ],
    "worldRanking": 84,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "CF Mounana Academy",
      "Mang asport Youth",
      "Bouenguidi Academy"
    ]
  },
  {
    "code": "BEN",
    "name": "Benin",
    "confederation": "CAF",
    "primaryKitColor": "#E8112D",
    "secondaryKitColor": "#008751",
    "flagColors": [
      "#E8112D",
      "#008751",
      "#FFFFFF"
    ],
    "worldRanking": 91,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Coton FC Academy",
      "Dadjè FC Youth",
      "ASPAC Academy"
    ]
  },
  {
    "code": "CPV",
    "name": "Cape Verde",
    "confederation": "CAF",
    "primaryKitColor": "#003893",
    "secondaryKitColor": "#CF2027",
    "flagColors": [
      "#003893",
      "#CF2027",
      "#FFFFFF"
    ],
    "worldRanking": 72,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Sporting Praia Youth",
      "Mindelense Academy",
      "Académica do Mindelo"
    ]
  },
  {
    "code": "MOZ",
    "name": "Mozambique",
    "confederation": "CAF",
    "primaryKitColor": "#009739",
    "secondaryKitColor": "#FCE100",
    "flagColors": [
      "#009739",
      "#FCE100",
      "#FFFFFF"
    ],
    "worldRanking": 103,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Black Bulls Academy",
      "Ferroviário Maputo Youth",
      "Costa do Sol Academy"
    ]
  },
  {
    "code": "NAM",
    "name": "Namibia",
    "confederation": "CAF",
    "primaryKitColor": "#003580",
    "secondaryKitColor": "#D21034",
    "flagColors": [
      "#003580",
      "#D21034",
      "#FFFFFF"
    ],
    "worldRanking": 106,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "African Stars Academy",
      "Black Africa Youth",
      "Tigers FC Academy"
    ]
  },
  {
    "code": "ENG",
    "name": "England",
    "confederation": "UEFA",
    "primaryKitColor": "#CE1124",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#CE1124",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 4,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 83,
    "localAcademies": [
      "Crewe Alexandra Academy",
      "Stockport County Academy",
      "Wrexham Academy"
    ]
  },
  {
    "code": "FRA",
    "name": "France",
    "confederation": "UEFA",
    "primaryKitColor": "#0055A4",
    "secondaryKitColor": "#EF4135",
    "flagColors": [
      "#0055A4",
      "#EF4135",
      "#FFFFFF"
    ],
    "worldRanking": 2,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 83,
    "localAcademies": [
      "Clairefontaine",
      "Lyon Academy",
      "Rennes Academy"
    ]
  },
  {
    "code": "ESP",
    "name": "Spain",
    "confederation": "UEFA",
    "primaryKitColor": "#AA151B",
    "secondaryKitColor": "#F1BF00",
    "flagColors": [
      "#AA151B",
      "#F1BF00",
      "#FFFFFF"
    ],
    "worldRanking": 3,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 83,
    "localAcademies": [
      "La Masia",
      "Real Madrid La Fábrica",
      "Athletic Club Lezama"
    ]
  },
  {
    "code": "GER",
    "name": "Germany",
    "confederation": "UEFA",
    "primaryKitColor": "#000000",
    "secondaryKitColor": "#DD0000",
    "flagColors": [
      "#000000",
      "#DD0000",
      "#FFFFFF"
    ],
    "worldRanking": 5,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 83,
    "localAcademies": [
      "Bayern Campus",
      "Schalke Knappenschmiede",
      "Stuttgart Academy"
    ]
  },
  {
    "code": "POR",
    "name": "Portugal",
    "confederation": "UEFA",
    "primaryKitColor": "#006600",
    "secondaryKitColor": "#FF0000",
    "flagColors": [
      "#006600",
      "#FF0000",
      "#FFFFFF"
    ],
    "worldRanking": 7,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Sporting CP Academy",
      "Benfica Campus",
      "FC Porto Dragon Force"
    ]
  },
  {
    "code": "ITA",
    "name": "Italy",
    "confederation": "UEFA",
    "primaryKitColor": "#009246",
    "secondaryKitColor": "#CE2B37",
    "flagColors": [
      "#009246",
      "#CE2B37",
      "#FFFFFF"
    ],
    "worldRanking": 9,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Atalanta Academy",
      "Inter Academy",
      "Juventus Academy"
    ]
  },
  {
    "code": "NED",
    "name": "Netherlands",
    "confederation": "UEFA",
    "primaryKitColor": "#F36C21",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#F36C21",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 6,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Ajax Academy",
      "PSV Academy",
      "AZ Youth"
    ]
  },
  {
    "code": "BEL",
    "name": "Belgium",
    "confederation": "UEFA",
    "primaryKitColor": "#000000",
    "secondaryKitColor": "#EF3340",
    "flagColors": [
      "#000000",
      "#EF3340",
      "#FFFFFF"
    ],
    "worldRanking": 8,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Anderlecht Academy",
      "Genk Academy",
      "Club Brugge Academy"
    ]
  },
  {
    "code": "CRO",
    "name": "Croatia",
    "confederation": "UEFA",
    "primaryKitColor": "#FF0000",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#FF0000",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 10,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Dinamo Zagreb Academy",
      "Hajduk Split Youth",
      "Osijek Academy"
    ]
  },
  {
    "code": "DEN",
    "name": "Denmark",
    "confederation": "UEFA",
    "primaryKitColor": "#C60C30",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#C60C30",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 21,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "FC Nordsjælland Academy",
      "FC Copenhagen School",
      "Midtjylland Academy"
    ]
  },
  {
    "code": "SWE",
    "name": "Sweden",
    "confederation": "UEFA",
    "primaryKitColor": "#006AA7",
    "secondaryKitColor": "#FECC00",
    "flagColors": [
      "#006AA7",
      "#FECC00",
      "#FFFFFF"
    ],
    "worldRanking": 27,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Malmö FF Academy",
      "IFK Göteborg Youth",
      "Hammarby Academy"
    ]
  },
  {
    "code": "NOR",
    "name": "Norway",
    "confederation": "UEFA",
    "primaryKitColor": "#BA0C2F",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#BA0C2F",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 29,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Rosenborg Academy",
      "Molde Youth",
      "Bodø/Glimt Academy"
    ]
  },
  {
    "code": "SUI",
    "name": "Switzerland",
    "confederation": "UEFA",
    "primaryKitColor": "#DA291C",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#DA291C",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 19,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Basel Academy",
      "Young Boys Academy",
      "Servette Youth"
    ]
  },
  {
    "code": "POL",
    "name": "Poland",
    "confederation": "UEFA",
    "primaryKitColor": "#FFFFFF",
    "secondaryKitColor": "#DC143C",
    "flagColors": [
      "#FFFFFF",
      "#DC143C",
      "#FFFFFF"
    ],
    "worldRanking": 30,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Legia Warsaw Academy",
      "Lech Poznań Academy",
      "Zagłębie Lubin Youth"
    ]
  },
  {
    "code": "SRB",
    "name": "Serbia",
    "confederation": "UEFA",
    "primaryKitColor": "#C6363C",
    "secondaryKitColor": "#0C4076",
    "flagColors": [
      "#C6363C",
      "#0C4076",
      "#FFFFFF"
    ],
    "worldRanking": 32,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Partizan Academy",
      "Red Star Belgrade Youth",
      "Vojvodina Academy"
    ]
  },
  {
    "code": "SCO",
    "name": "Scotland",
    "confederation": "UEFA",
    "primaryKitColor": "#0065BD",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#0065BD",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 39,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Celtic Academy",
      "Rangers Academy",
      "Hearts Youth"
    ]
  },
  {
    "code": "IRL",
    "name": "Ireland",
    "confederation": "UEFA",
    "primaryKitColor": "#169B62",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#169B62",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 60,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Shamrock Rovers Academy",
      "St Patrick's Athletic Youth",
      "Bohemians Academy"
    ]
  },
  {
    "code": "TUR",
    "name": "Turkey",
    "confederation": "UEFA",
    "primaryKitColor": "#E30A17",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#E30A17",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 26,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Galatasaray Academy",
      "Fenerbahçe Youth",
      "Beşiktaş Academy"
    ]
  },
  {
    "code": "UKR",
    "name": "Ukraine",
    "confederation": "UEFA",
    "primaryKitColor": "#0057B7",
    "secondaryKitColor": "#FFD700",
    "flagColors": [
      "#0057B7",
      "#FFD700",
      "#FFFFFF"
    ],
    "worldRanking": 25,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Shakhtar Academy",
      "Dynamo Kyiv Youth",
      "Rukh Lviv Academy"
    ]
  },
  {
    "code": "AUT",
    "name": "Austria",
    "confederation": "UEFA",
    "primaryKitColor": "#ED2939",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#ED2939",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 23,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Red Bull Salzburg Academy",
      "Rapid Wien Youth",
      "Austria Wien Academy"
    ]
  },
  {
    "code": "GRE",
    "name": "Greece",
    "confederation": "UEFA",
    "primaryKitColor": "#0D5EAF",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#0D5EAF",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 48,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Olympiacos Academy",
      "PAOK Youth",
      "Panathinaikos Academy"
    ]
  },
  {
    "code": "CZE",
    "name": "Czechia",
    "confederation": "UEFA",
    "primaryKitColor": "#D7141A",
    "secondaryKitColor": "#11457E",
    "flagColors": [
      "#D7141A",
      "#11457E",
      "#FFFFFF"
    ],
    "worldRanking": 40,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Sparta Prague Academy",
      "Slavia Prague Youth",
      "Baník Ostrava Academy"
    ]
  },
  {
    "code": "BRA",
    "name": "Brazil",
    "confederation": "CONMEBOL",
    "primaryKitColor": "#009739",
    "secondaryKitColor": "#FFDF00",
    "flagColors": [
      "#009739",
      "#FFDF00",
      "#FFFFFF"
    ],
    "worldRanking": 1,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 83,
    "localAcademies": [
      "Santos Academy",
      "Fluminense Xerém",
      "Palmeiras Academy"
    ]
  },
  {
    "code": "ARG",
    "name": "Argentina",
    "confederation": "CONMEBOL",
    "primaryKitColor": "#75AADB",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#75AADB",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 1,
    "u21OvrRequired": 70,
    "seniorOvrRequired": 83,
    "localAcademies": [
      "River Plate Academy",
      "Boca Juniors Youth",
      "Vélez Sarsfield Academy"
    ]
  },
  {
    "code": "URU",
    "name": "Uruguay",
    "confederation": "CONMEBOL",
    "primaryKitColor": "#5AB6E6",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#5AB6E6",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 15,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Peñarol Academy",
      "Nacional Youth",
      "Defensor Sporting Academy"
    ]
  },
  {
    "code": "COL",
    "name": "Colombia",
    "confederation": "CONMEBOL",
    "primaryKitColor": "#FCD116",
    "secondaryKitColor": "#003893",
    "flagColors": [
      "#FCD116",
      "#003893",
      "#FFFFFF"
    ],
    "worldRanking": 12,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Atlético Nacional Academy",
      "Deportivo Cali Youth",
      "Envigado Academy"
    ]
  },
  {
    "code": "CHI",
    "name": "Chile",
    "confederation": "CONMEBOL",
    "primaryKitColor": "#D52B1E",
    "secondaryKitColor": "#0039A6",
    "flagColors": [
      "#D52B1E",
      "#0039A6",
      "#FFFFFF"
    ],
    "worldRanking": 50,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Colo-Colo Academy",
      "Universidad de Chile Youth",
      "Huachipato Academy"
    ]
  },
  {
    "code": "ECU",
    "name": "Ecuador",
    "confederation": "CONMEBOL",
    "primaryKitColor": "#FFDD00",
    "secondaryKitColor": "#034EA2",
    "flagColors": [
      "#FFDD00",
      "#034EA2",
      "#FFFFFF"
    ],
    "worldRanking": 24,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Independiente del Valle",
      "LDU Quito Academy",
      "Barcelona SC Youth"
    ]
  },
  {
    "code": "PER",
    "name": "Peru",
    "confederation": "CONMEBOL",
    "primaryKitColor": "#D91023",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#D91023",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 42,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Alianza Lima Academy",
      "Sporting Cristal Youth",
      "Universitario Academy"
    ]
  },
  {
    "code": "PAR",
    "name": "Paraguay",
    "confederation": "CONMEBOL",
    "primaryKitColor": "#D52B1E",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#D52B1E",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 53,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Libertad Academy",
      "Cerro Porteño Youth",
      "Olimpia Academy"
    ]
  },
  {
    "code": "VEN",
    "name": "Venezuela",
    "confederation": "CONMEBOL",
    "primaryKitColor": "#FCE300",
    "secondaryKitColor": "#CF142B",
    "flagColors": [
      "#FCE300",
      "#CF142B",
      "#FFFFFF"
    ],
    "worldRanking": 48,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Deportivo Táchira Academy",
      "Caracas FC Youth",
      "Monagas Academy"
    ]
  },
  {
    "code": "USA",
    "name": "United States",
    "confederation": "CONCACAF",
    "primaryKitColor": "#3C3B6E",
    "secondaryKitColor": "#B22234",
    "flagColors": [
      "#3C3B6E",
      "#B22234",
      "#FFFFFF"
    ],
    "worldRanking": 16,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "FC Dallas Academy",
      "Philadelphia Union Academy",
      "LA Galaxy Academy"
    ]
  },
  {
    "code": "MEX",
    "name": "Mexico",
    "confederation": "CONCACAF",
    "primaryKitColor": "#006847",
    "secondaryKitColor": "#CE1126",
    "flagColors": [
      "#006847",
      "#CE1126",
      "#FFFFFF"
    ],
    "worldRanking": 17,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Pachuca Academy",
      "Club América Youth",
      "Chivas Academy"
    ]
  },
  {
    "code": "CAN",
    "name": "Canada",
    "confederation": "CONCACAF",
    "primaryKitColor": "#D80621",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#D80621",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 35,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Toronto FC Academy",
      "Vancouver Whitecaps Academy",
      "CF Montréal Academy"
    ]
  },
  {
    "code": "JAM",
    "name": "Jamaica",
    "confederation": "CONCACAF",
    "primaryKitColor": "#009B3A",
    "secondaryKitColor": "#FED100",
    "flagColors": [
      "#009B3A",
      "#FED100",
      "#FFFFFF"
    ],
    "worldRanking": 58,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Harbour View Academy",
      "Mount Pleasant Youth",
      "Portmore United Academy"
    ]
  },
  {
    "code": "CRC",
    "name": "Costa Rica",
    "confederation": "CONCACAF",
    "primaryKitColor": "#CE1126",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#CE1126",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 49,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Saprissa Academy",
      "Alajuelense Youth",
      "Herediano Academy"
    ]
  },
  {
    "code": "PAN",
    "name": "Panama",
    "confederation": "CONCACAF",
    "primaryKitColor": "#DA121A",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#DA121A",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 43,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Tauro FC Academy",
      "Plaza Amador Youth",
      "San Francisco FC Academy"
    ]
  },
  {
    "code": "HON",
    "name": "Honduras",
    "confederation": "CONCACAF",
    "primaryKitColor": "#0073CF",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#0073CF",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 78,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Olimpia Academy",
      "Motagua Youth",
      "Real España Academy"
    ]
  },
  {
    "code": "GUA",
    "name": "Guatemala",
    "confederation": "CONCACAF",
    "primaryKitColor": "#4997D0",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#4997D0",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 95,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Comunicaciones Academy",
      "Municipal Youth",
      "Antigua GFC Academy"
    ]
  },
  {
    "code": "HAI",
    "name": "Haiti",
    "confederation": "CONCACAF",
    "primaryKitColor": "#D21034",
    "secondaryKitColor": "#00209F",
    "flagColors": [
      "#D21034",
      "#00209F",
      "#FFFFFF"
    ],
    "worldRanking": 86,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Violette AC Academy",
      "Racing Club Haïtien Youth",
      "Don Bosco Academy"
    ]
  },
  {
    "code": "JPN",
    "name": "Japan",
    "confederation": "AFC",
    "primaryKitColor": "#BC002D",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#BC002D",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 18,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Kashima Antlers Academy",
      "Cerezo Osaka Youth",
      "FC Tokyo Academy"
    ]
  },
  {
    "code": "KOR",
    "name": "South Korea",
    "confederation": "AFC",
    "primaryKitColor": "#CD2E3A",
    "secondaryKitColor": "#0047A0",
    "flagColors": [
      "#CD2E3A",
      "#0047A0",
      "#FFFFFF"
    ],
    "worldRanking": 22,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "FC Seoul Academy",
      "Jeonbuk Hyundai Youth",
      "Ulsan HD Academy"
    ]
  },
  {
    "code": "KSA",
    "name": "Saudi Arabia",
    "confederation": "AFC",
    "primaryKitColor": "#006C35",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#006C35",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 56,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Al Hilal Academy",
      "Al Nassr Youth",
      "Al Ittihad Academy"
    ]
  },
  {
    "code": "AUS",
    "name": "Australia",
    "confederation": "AFC",
    "primaryKitColor": "#FFCD00",
    "secondaryKitColor": "#00843D",
    "flagColors": [
      "#FFCD00",
      "#00843D",
      "#FFFFFF"
    ],
    "worldRanking": 24,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Melbourne City Academy",
      "Sydney FC Youth",
      "Central Coast Academy"
    ]
  },
  {
    "code": "IRN",
    "name": "Iran",
    "confederation": "AFC",
    "primaryKitColor": "#239F40",
    "secondaryKitColor": "#DA0000",
    "flagColors": [
      "#239F40",
      "#DA0000",
      "#FFFFFF"
    ],
    "worldRanking": 20,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 79,
    "localAcademies": [
      "Esteghlal Academy",
      "Persepolis Youth",
      "Sepahan Academy"
    ]
  },
  {
    "code": "QAT",
    "name": "Qatar",
    "confederation": "AFC",
    "primaryKitColor": "#8A1538",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#8A1538",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 34,
    "u21OvrRequired": 66,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Aspire Academy",
      "Al Sadd Youth",
      "Al Duhail Academy"
    ]
  },
  {
    "code": "IRQ",
    "name": "Iraq",
    "confederation": "AFC",
    "primaryKitColor": "#007A3D",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#007A3D",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 59,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 76,
    "localAcademies": [
      "Al-Shorta Academy",
      "Al-Zawraa Youth",
      "Erbil Academy"
    ]
  },
  {
    "code": "UZB",
    "name": "Uzbekistan",
    "confederation": "AFC",
    "primaryKitColor": "#1EB53A",
    "secondaryKitColor": "#0099B5",
    "flagColors": [
      "#1EB53A",
      "#0099B5",
      "#FFFFFF"
    ],
    "worldRanking": 62,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Pakhtakor Academy",
      "Bunyodkor Youth",
      "Nasaf Academy"
    ]
  },
  {
    "code": "CHN",
    "name": "China PR",
    "confederation": "AFC",
    "primaryKitColor": "#DE2910",
    "secondaryKitColor": "#FFDE00",
    "flagColors": [
      "#DE2910",
      "#FFDE00",
      "#FFFFFF"
    ],
    "worldRanking": 88,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Shandong Taishan Academy",
      "Shanghai Port Youth",
      "Guangzhou Academy"
    ]
  },
  {
    "code": "IND",
    "name": "India",
    "confederation": "AFC",
    "primaryKitColor": "#FF9933",
    "secondaryKitColor": "#138808",
    "flagColors": [
      "#FF9933",
      "#138808",
      "#FFFFFF"
    ],
    "worldRanking": 99,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "AIFF Elite Academy",
      "Bengaluru FC Youth",
      "Reliance Foundation Young Champs"
    ]
  },
  {
    "code": "THA",
    "name": "Thailand",
    "confederation": "AFC",
    "primaryKitColor": "#A51931",
    "secondaryKitColor": "#2D2A4A",
    "flagColors": [
      "#A51931",
      "#2D2A4A",
      "#FFFFFF"
    ],
    "worldRanking": 100,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Buriram United Academy",
      "BG Pathum Youth",
      "Muangthong Academy"
    ]
  },
  {
    "code": "NZL",
    "name": "New Zealand",
    "confederation": "OFC",
    "primaryKitColor": "#000000",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#000000",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 86,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Wellington Phoenix Academy",
      "Auckland City Youth",
      "Christchurch United Academy"
    ]
  },
  {
    "code": "FIJ",
    "name": "Fiji",
    "confederation": "OFC",
    "primaryKitColor": "#68BFE5",
    "secondaryKitColor": "#FFFFFF",
    "flagColors": [
      "#68BFE5",
      "#FFFFFF",
      "#FFFFFF"
    ],
    "worldRanking": 160,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Ba FC Academy",
      "Lautoka Youth",
      "Rewa Academy"
    ]
  },
  {
    "code": "PNG",
    "name": "Papua New Guinea",
    "confederation": "OFC",
    "primaryKitColor": "#000000",
    "secondaryKitColor": "#CE1126",
    "flagColors": [
      "#000000",
      "#CE1126",
      "#FFFFFF"
    ],
    "worldRanking": 165,
    "u21OvrRequired": 63,
    "seniorOvrRequired": 71,
    "localAcademies": [
      "Hekari United Academy",
      "Lae City Youth",
      "Besta PNG Academy"
    ]
  }
];
export const CONFEDERATIONS: Confederation[] = ["CAF","UEFA","CONMEBOL","CONCACAF","AFC","OFC"];
export const findNation = (value:string) => NATIONS_DATABASE.find(n=>n.code===value || n.name.toLowerCase()===value.toLowerCase());
export function getNationFlagSvg(nationOrCode:string,size=28):string {
 const n=findNation(nationOrCode); if(!n) return '';
 const [a,b,c]=n.flagColors; const code=n.code;
 const horizontal = ['ZAM','NGA','GHA','MAR','EGY','SEN','CIV','CMR','ALG','TUN','MLI','COD','KEN','TAN','UGA','ZIM','ANG','BFA','GUI','GAB','BEN','MOZ','NAM','GER','NED','CRO','DEN','SWE','NOR','POL','SRB','IRL','AUT','BRA','ARG','URU','COL','CHI','ECU','PER','PAR','VEN','MEX','JAM','CRC','HON','GUA','HAI','KOR','KSA','IRN','QAT','IRQ','UZB','CHN','IND','THA','FIJ','PNG'].includes(code);
 const stripes=horizontal ? '<rect width="60" height="40" fill="'+a+'"/><rect y="13.33" width="60" height="13.34" fill="'+b+'"/><rect y="26.66" width="60" height="13.34" fill="'+c+'"/>' : '<rect width="60" height="40" fill="'+b+'"/><rect width="20" height="40" fill="'+a+'"/><rect x="40" width="20" height="40" fill="'+c+'"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+Math.round(size*2/3)+'" viewBox="0 0 60 40" role="img" aria-label="'+n.name+' flag">'+stripes+'<rect x=".5" y=".5" width="59" height="39" fill="none" stroke="#64748b" stroke-opacity=".35"/></svg>';
}
