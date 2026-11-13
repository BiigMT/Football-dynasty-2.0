import {
  Club,
  ClubTactics,
  Fixture,
  Formation,
  League,
  NationalTeam,
  Player,
  PlayerAppearance,
  PlayerAttributes,
  PlayingStyle,
  Position,
  Region,
} from '../types/football';

interface ClubBlueprint {
  id: string;
  name: string;
  shortName: string;
  country: string;
  primaryColor: string;
  secondaryColor: string;
  reputation: number;
  stadiumName: string;
  stadiumCapacity: number;
  formation: Formation;
}

interface LeagueBlueprint {
  id: string;
  name: string;
  country: string;
  region: Region;
  tier: number;
  clubs: ClubBlueprint[];
}

export const LEAGUE_BLUEPRINTS: LeagueBlueprint[] = [
  {
    id: 'eng_prem',
    name: 'English Premier Division',
    country: 'England',
    region: 'EUROPE',
    tier: 1,
    clubs: [
      { id: 'man_sky', name: 'Manchester Sky', shortName: 'MCY', country: 'England', primaryColor: '#38BDF8', secondaryColor: '#FFFFFF', reputation: 91, stadiumName: 'Eastlands Arena', stadiumCapacity: 53400, formation: '4-3-3' },
      { id: 'north_gunners', name: 'North London Gunners', shortName: 'NLG', country: 'England', primaryColor: '#EF4444', secondaryColor: '#FFFFFF', reputation: 88, stadiumName: 'Highbury Dome', stadiumCapacity: 60700, formation: '4-3-3' },
      { id: 'mersey_reds', name: 'Merseyside Reds', shortName: 'MSR', country: 'England', primaryColor: '#DC2626', secondaryColor: '#FACC15', reputation: 89, stadiumName: 'Anfield Park', stadiumCapacity: 61200, formation: '4-2-3-1' },
      { id: 'west_blues', name: 'West London Blues', shortName: 'WLB', country: 'England', primaryColor: '#2563EB', secondaryColor: '#FFFFFF', reputation: 85, stadiumName: 'Stamford Bridge Ground', stadiumCapacity: 40300, formation: '4-2-3-1' },
      { id: 'man_red', name: 'Manchester United FC', shortName: 'MNU', country: 'England', primaryColor: '#B91C1C', secondaryColor: '#111827', reputation: 86, stadiumName: 'Trafford Theatre', stadiumCapacity: 74300, formation: '4-2-3-1' },
      { id: 'tyne_magpies', name: 'Tyneside United', shortName: 'TYN', country: 'England', primaryColor: '#1F2937', secondaryColor: '#F8FAFC', reputation: 81, stadiumName: 'St. James Bowl', stadiumCapacity: 52300, formation: '4-3-3' },
      { id: 'birm_villa', name: 'Midlands Villa', shortName: 'MVL', country: 'England', primaryColor: '#7C2D12', secondaryColor: '#38BDF8', reputation: 79, stadiumName: 'Aston Ground', stadiumCapacity: 42600, formation: '4-4-2' },
      { id: 'spurs_lily', name: 'Tottenham Lilywhites', shortName: 'TOT', country: 'England', primaryColor: '#F8FAFC', secondaryColor: '#1E293B', reputation: 82, stadiumName: 'White Hart Bowl', stadiumCapacity: 62800, formation: '4-3-3' },
    ],
  },
  {
    id: 'esp_liga',
    name: 'Iberia Primera',
    country: 'Spain',
    region: 'EUROPE',
    tier: 1,
    clubs: [
      { id: 'real_castilla', name: 'Real Castilla', shortName: 'RCS', country: 'Spain', primaryColor: '#F8FAFC', secondaryColor: '#F59E0B', reputation: 93, stadiumName: 'Chamartin Coliseum', stadiumCapacity: 81000, formation: '4-3-3' },
      { id: 'catalunya_blau', name: 'FC Catalunya', shortName: 'CAT', country: 'Spain', primaryColor: '#1D4ED8', secondaryColor: '#B91C1C', reputation: 90, stadiumName: 'Nou Estadi', stadiumCapacity: 89000, formation: '4-3-3' },
      { id: 'atleti_madrid', name: 'Atletico Capital', shortName: 'ATC', country: 'Spain', primaryColor: '#DC2626', secondaryColor: '#F8FAFC', reputation: 86, stadiumName: 'Metropolitano Norte', stadiumCapacity: 70400, formation: '5-3-2' },
      { id: 'basque_lions', name: 'Bilbao Lions', shortName: 'BIL', country: 'Spain', primaryColor: '#E11D48', secondaryColor: '#111827', reputation: 80, stadiumName: 'San Mames Cathedral', stadiumCapacity: 53300, formation: '4-2-3-1' },
      { id: 'sevilla_nervion', name: 'Sevilla Nervion', shortName: 'SEV', country: 'Spain', primaryColor: '#F1F5F9', secondaryColor: '#DC2626', reputation: 79, stadiumName: 'Pizjuan Ground', stadiumCapacity: 43800, formation: '4-3-3' },
      { id: 'valencia_bats', name: 'Valencia Mestalla', shortName: 'VAL', country: 'Spain', primaryColor: '#F8FAFC', secondaryColor: '#F97316', reputation: 77, stadiumName: 'Mestalla Arena', stadiumCapacity: 49400, formation: '4-4-2' },
      { id: 'sociedad_blue', name: 'San Sebastian Blue', shortName: 'SSB', country: 'Spain', primaryColor: '#0284C7', secondaryColor: '#FFFFFF', reputation: 80, stadiumName: 'Anoeta Park', stadiumCapacity: 39500, formation: '4-3-3' },
      { id: 'villarreal_sub', name: 'Villarreal Yellows', shortName: 'VIL', country: 'Spain', primaryColor: '#EAB308', secondaryColor: '#1E3A8A', reputation: 78, stadiumName: 'El Madrigal', stadiumCapacity: 23500, formation: '4-4-2' },
    ],
  },
  {
    id: 'caf_prem',
    name: 'African Continental League',
    country: 'Pan-Africa',
    region: 'AFRICA',
    tier: 1,
    clubs: [
      { id: 'cairo_eagles', name: 'Cairo Red Eagles', shortName: 'CRE', country: 'Egypt', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 82, stadiumName: 'Cairo International', stadiumCapacity: 75000, formation: '4-3-3' },
      { id: 'casa_wydad', name: 'Casablanca Atlas', shortName: 'CAS', country: 'Morocco', primaryColor: '#B91C1C', secondaryColor: '#FFFFFF', reputation: 80, stadiumName: 'Stade Mohammed V', stadiumCapacity: 67000, formation: '4-2-3-1' },
      { id: 'tshwane_downs', name: 'Tshwane Brazilians', shortName: 'TSH', country: 'South Africa', primaryColor: '#EAB308', secondaryColor: '#16A34A', reputation: 81, stadiumName: 'Loftus Versfeld', stadiumCapacity: 51700, formation: '3-5-2' },
      { id: 'tunis_esperance', name: 'Tunis Blood & Gold', shortName: 'TUN', country: 'Tunisia', primaryColor: '#F59E0B', secondaryColor: '#DC2626', reputation: 78, stadiumName: 'Rades Olympic', stadiumCapacity: 60000, formation: '4-3-3' },
      { id: 'lubumbashi_ravens', name: 'Lubumbashi Ravens', shortName: 'LUB', country: 'DR Congo', primaryColor: '#1E293B', secondaryColor: '#F8FAFC', reputation: 77, stadiumName: 'Kamalondo Arena', stadiumCapacity: 18500, formation: '4-4-2' },
      { id: 'dar_lions', name: 'Dar es Salaam Simba', shortName: 'DAR', country: 'Tanzania', primaryColor: '#EF4444', secondaryColor: '#FFFFFF', reputation: 75, stadiumName: 'Mkapa National', stadiumCapacity: 60000, formation: '4-2-3-1' },
      { id: 'enyimba_elephants', name: 'Aba Elephants', shortName: 'ABA', country: 'Nigeria', primaryColor: '#2563EB', secondaryColor: '#FFFFFF', reputation: 76, stadiumName: 'Enyimba Township', stadiumCapacity: 25000, formation: '4-3-3' },
      { id: 'lusaka_arrows', name: 'Lusaka Dynamos', shortName: 'LUS', country: 'Zambia', primaryColor: '#15803D', secondaryColor: '#F97316', reputation: 74, stadiumName: 'Heroes National', stadiumCapacity: 60000, formation: '4-4-2' },
    ],
  },
  {
    id: 'ita_serie',
    name: 'Calcio Serie A',
    country: 'Italy',
    region: 'EUROPE',
    tier: 1,
    clubs: [
      { id: 'milano_nerazzurri', name: 'Milano Inter', shortName: 'INT', country: 'Italy', primaryColor: '#1D4ED8', secondaryColor: '#0F172A', reputation: 89, stadiumName: 'Giuseppe Meazza', stadiumCapacity: 75800, formation: '3-5-2' },
      { id: 'milano_rossoneri', name: 'AC Milano', shortName: 'ACM', country: 'Italy', primaryColor: '#DC2626', secondaryColor: '#0F172A', reputation: 86, stadiumName: 'San Siro', stadiumCapacity: 75800, formation: '4-2-3-1' },
      { id: 'torino_zebre', name: 'Torino Bianconeri', shortName: 'TOR', country: 'Italy', primaryColor: '#F8FAFC', secondaryColor: '#111827', reputation: 86, stadiumName: 'Piedmont Stadium', stadiumCapacity: 41500, formation: '3-5-2' },
      { id: 'napoli_azzurri', name: 'Napoli Partenopei', shortName: 'NAP', country: 'Italy', primaryColor: '#0EA5E9', secondaryColor: '#FFFFFF', reputation: 84, stadiumName: 'Stadio Vesuvio', stadiumCapacity: 54700, formation: '4-3-3' },
      { id: 'roma_gladiators', name: 'AS Roma Wolves', shortName: 'ROM', country: 'Italy', primaryColor: '#991B1B', secondaryColor: '#F59E0B', reputation: 82, stadiumName: 'Olimpico Roma', stadiumCapacity: 70600, formation: '3-5-2' },
      { id: 'bergamo_dea', name: 'Bergamo Atalanta', shortName: 'ATA', country: 'Italy', primaryColor: '#1E40AF', secondaryColor: '#111827', reputation: 81, stadiumName: 'Gewiss Ground', stadiumCapacity: 24900, formation: '3-5-2' },
      { id: 'lazio_eagles', name: 'Lazio Eagles', shortName: 'LAZ', country: 'Italy', primaryColor: '#7DD3FC', secondaryColor: '#FFFFFF', reputation: 79, stadiumName: 'Olimpico Nord', stadiumCapacity: 70600, formation: '4-3-3' },
      { id: 'firenze_viola', name: 'Firenze Viola', shortName: 'FIO', country: 'Italy', primaryColor: '#7C3AED', secondaryColor: '#FFFFFF', reputation: 78, stadiumName: 'Artemio Franchi', stadiumCapacity: 43100, formation: '4-2-3-1' },
    ],
  },
  {
    id: 'sa_brasileiro',
    name: 'Copa Sudamericana Liga',
    country: 'Brazil & Argentina',
    region: 'SOUTH_AMERICA',
    tier: 1,
    clubs: [
      { id: 'rio_flamengo', name: 'Rio Rubro-Negro', shortName: 'RIO', country: 'Brazil', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 84, stadiumName: 'Maracana', stadiumCapacity: 78800, formation: '4-2-3-1' },
      { id: 'sp_palmeiras', name: 'Sao Paulo Verdao', shortName: 'SPV', country: 'Brazil', primaryColor: '#15803D', secondaryColor: '#FFFFFF', reputation: 83, stadiumName: 'Allianz Parque', stadiumCapacity: 43700, formation: '4-3-3' },
      { id: 'ba_river', name: 'Buenos Aires Millonarios', shortName: 'BAM', country: 'Argentina', primaryColor: '#F8FAFC', secondaryColor: '#DC2626', reputation: 83, stadiumName: 'El Monumental', stadiumCapacity: 84500, formation: '4-3-3' },
      { id: 'ba_boca', name: 'La Boca Xeneizes', shortName: 'BOC', country: 'Argentina', primaryColor: '#1E3A8A', secondaryColor: '#FACC15', reputation: 82, stadiumName: 'La Bombonera', stadiumCapacity: 54000, formation: '4-4-2' },
      { id: 'bh_galo', name: 'Minas Galo', shortName: 'MGL', country: 'Brazil', primaryColor: '#1E293B', secondaryColor: '#FFFFFF', reputation: 79, stadiumName: 'Arena MRV', stadiumCapacity: 46000, formation: '4-3-3' },
      { id: 'poa_tricolor', name: 'Porto Alegre Tricolor', shortName: 'PAT', country: 'Brazil', primaryColor: '#0284C7', secondaryColor: '#111827', reputation: 78, stadiumName: 'Arena do Sul', stadiumCapacity: 55600, formation: '4-2-3-1' },
      { id: 'ave_racing', name: 'Avellaneda Academia', shortName: 'ACA', country: 'Argentina', primaryColor: '#38BDF8', secondaryColor: '#FFFFFF', reputation: 77, stadiumName: 'El Cilindro', stadiumCapacity: 51000, formation: '3-5-2' },
      { id: 'mvd_nacional', name: 'Montevideo Bolsos', shortName: 'MVD', country: 'Uruguay', primaryColor: '#F8FAFC', secondaryColor: '#1D4ED8', reputation: 76, stadiumName: 'Gran Parque Central', stadiumCapacity: 34000, formation: '4-4-2' },
    ],
  },
  {
    id: 'asia_pro',
    name: 'Asia Champions Pro League',
    country: 'Japan & Gulf',
    region: 'ASIA',
    tier: 1,
    clubs: [
      { id: 'riyadh_crescent', name: 'Riyadh Al-Crescent', shortName: 'RIY', country: 'Saudi Arabia', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 83, stadiumName: 'Kingdom Arena', stadiumCapacity: 68000, formation: '4-2-3-1' },
      { id: 'tokyo_marinos', name: 'Yokohama Tricolore', shortName: 'YOK', country: 'Japan', primaryColor: '#2563EB', secondaryColor: '#DC2626', reputation: 79, stadiumName: 'Nissan Stadium', stadiumCapacity: 72300, formation: '4-3-3' },
      { id: 'urawa_diamonds', name: 'Urawa Red Diamonds', shortName: 'URA', country: 'Japan', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 78, stadiumName: 'Saitama Stadium', stadiumCapacity: 63700, formation: '4-2-3-1' },
      { id: 'seoul_tigers', name: 'Seoul Hyundai', shortName: 'SEO', country: 'South Korea', primaryColor: '#166534', secondaryColor: '#FACC15', reputation: 78, stadiumName: 'Seoul World Cup', stadiumCapacity: 66700, formation: '4-4-2' },
      { id: 'jeddah_tigers', name: 'Jeddah Al-Ittihad', shortName: 'JED', country: 'Saudi Arabia', primaryColor: '#FACC15', secondaryColor: '#111827', reputation: 80, stadiumName: 'King Abdullah Sports', stadiumCapacity: 62300, formation: '4-3-3' },
      { id: 'kobe_crimson', name: 'Kobe Crimson', shortName: 'KOB', country: 'Japan', primaryColor: '#881337', secondaryColor: '#FFFFFF', reputation: 79, stadiumName: 'Noevir Stadium', stadiumCapacity: 30100, formation: '4-3-3' },
      { id: 'doha_sadd', name: 'Doha Al-Wolves', shortName: 'DOH', country: 'Qatar', primaryColor: '#F8FAFC', secondaryColor: '#111827', reputation: 77, stadiumName: 'Jassim Bin Hamad', stadiumCapacity: 15000, formation: '4-2-3-1' },
      { id: 'ulsan_horangi', name: 'Ulsan Tigers', shortName: 'ULS', country: 'South Korea', primaryColor: '#0284C7', secondaryColor: '#F59E0B', reputation: 77, stadiumName: 'Munsu Football Stadium', stadiumCapacity: 44100, formation: '4-3-3' },
    ],
  },
];

export const NATIONAL_TEAM_BLUEPRINTS: Array<{
  id: string;
  name: string;
  code: string;
  region: Region;
  primaryColor: string;
  secondaryColor: string;
  worldRank: number;
  reputation: number;
  formation: Formation;
}> = [
  { id: 'nat_arg', name: 'Argentina', code: 'ARG', region: 'SOUTH_AMERICA', primaryColor: '#38BDF8', secondaryColor: '#FFFFFF', worldRank: 1, reputation: 92, formation: '4-3-3' },
  { id: 'nat_fra', name: 'France', code: 'FRA', region: 'EUROPE', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', worldRank: 2, reputation: 91, formation: '4-2-3-1' },
  { id: 'nat_esp', name: 'Spain', code: 'ESP', region: 'EUROPE', primaryColor: '#DC2626', secondaryColor: '#FACC15', worldRank: 3, reputation: 90, formation: '4-3-3' },
  { id: 'nat_eng', name: 'England', code: 'ENG', region: 'EUROPE', primaryColor: '#F8FAFC', secondaryColor: '#1E3A8A', worldRank: 4, reputation: 89, formation: '4-2-3-1' },
  { id: 'nat_bra', name: 'Brazil', code: 'BRA', region: 'SOUTH_AMERICA', primaryColor: '#EAB308', secondaryColor: '#15803D', worldRank: 5, reputation: 89, formation: '4-3-3' },
  { id: 'nat_mar', name: 'Morocco', code: 'MAR', region: 'AFRICA', primaryColor: '#B91C1C', secondaryColor: '#15803D', worldRank: 11, reputation: 84, formation: '4-3-3' },
  { id: 'nat_sen', name: 'Senegal', code: 'SEN', region: 'AFRICA', primaryColor: '#16A34A', secondaryColor: '#FACC15', worldRank: 15, reputation: 82, formation: '4-3-3' },
  { id: 'nat_jpn', name: 'Japan', code: 'JPN', region: 'ASIA', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', worldRank: 16, reputation: 82, formation: '4-2-3-1' },
  { id: 'nat_nga', name: 'Nigeria', code: 'NGA', region: 'AFRICA', primaryColor: '#15803D', secondaryColor: '#FFFFFF', worldRank: 24, reputation: 80, formation: '4-3-3' },
  { id: 'nat_egy', name: 'Egypt', code: 'EGY', region: 'AFRICA', primaryColor: '#DC2626', secondaryColor: '#111827', worldRank: 26, reputation: 80, formation: '4-2-3-1' },
  { id: 'nat_civ', name: 'Ivory Coast', code: 'CIV', region: 'AFRICA', primaryColor: '#F97316', secondaryColor: '#16A34A', worldRank: 28, reputation: 79, formation: '4-3-3' },
  { id: 'nat_kor', name: 'South Korea', code: 'KOR', region: 'ASIA', primaryColor: '#E11D48', secondaryColor: '#FFFFFF', worldRank: 22, reputation: 79, formation: '4-4-2' },
  { id: 'nat_ita', name: 'Italy', code: 'ITA', region: 'EUROPE', primaryColor: '#2563EB', secondaryColor: '#FFFFFF', worldRank: 9, reputation: 86, formation: '3-5-2' },
  { id: 'nat_rsa', name: 'South Africa', code: 'RSA', region: 'AFRICA', primaryColor: '#EAB308', secondaryColor: '#15803D', worldRank: 34, reputation: 76, formation: '4-3-3' },
  { id: 'nat_zmb', name: 'Zambia', code: 'ZAM', region: 'AFRICA', primaryColor: '#16A34A', secondaryColor: '#F97316', worldRank: 42, reputation: 74, formation: '4-4-2' },
  { id: 'nat_ksa', name: 'Saudi Arabia', code: 'KSA', region: 'ASIA', primaryColor: '#15803D', secondaryColor: '#FFFFFF', worldRank: 38, reputation: 75, formation: '4-3-3' },
];

const FIRST_NAMES_BY_REGION: Record<Region, string[]> = {
  EUROPE: ['Liam', 'Marco', 'Mateo', 'Lucas', 'Julian', 'Oliver', 'Hugo', 'Matteo', 'Daniel', 'Noah', 'Alessandro', 'Carlos', 'Adrian', 'Theo', 'Leo', 'Ethan', 'Bruno', 'Gabriel'],
  AFRICA: ['Chinedu', 'Youssef', 'Kofi', 'Tariq', 'Samuel', 'Ibrahim', 'Moussa', 'Tendai', 'Patson', 'Sadio', 'Hakim', 'Victor', 'Idrissa', 'Emmanuel', 'Tarek', 'Bongani', 'Ayoub', 'Fiston'],
  SOUTH_AMERICA: ['Thiago', 'Matias', 'enzo', 'Rodrigo', 'Joaquin', 'Vinicius', 'Rafael', 'Nicolas', 'Santiago', 'Lautaro', 'Franco', 'Caua', 'Murilo', 'Facundo', 'Diego', 'Danilo'],
  ASIA: ['Kenji', 'Min-Jae', 'Haruto', 'Salem', 'Daichi', 'Heung-Su', 'Yuto', 'Firas', 'Takumi', 'Jae-Sung', 'Riku', 'Akram', 'Sora', 'Abdullah', 'Koji', 'Woo-Yeong'],
};

const LAST_NAMES_BY_REGION: Record<Region, string[]> = {
  EUROPE: ['Sterling', 'Conti', 'Navarro', 'Moreau', 'Belling', 'Rossi', 'Silva', 'Vargas', 'Walker', 'Esposito', 'Serrano', 'Dubois', 'Romano', 'Gomez', 'Taylor', 'Bellini', 'Alvarez', 'Bennett'],
  AFRICA: ['Okafor', 'Benali', 'Mensah', 'Diallo', 'Banda', 'Kouyate', 'El-Shenawy', 'Mokoena', 'Chukwu', 'Ndiaye', 'Toure', 'Kante', 'Ziyech', 'Tau', 'Mayele', 'Phiri', 'Abubakar', 'Hakimi'],
  SOUTH_AMERICA: ['Almeida', 'Fernandez', 'Souza', 'Pereira', 'Martinez', 'Gomes', 'Rojas', 'Costa', 'Cardozo', 'Molina', 'Oliveira', 'Santana', 'Vega', 'Barbosa', 'Bustos', 'Gimenez'],
  ASIA: ['Tanaka', 'Kim', 'Sato', 'Al-Dawsari', 'Watanabe', 'Park', 'Nakamura', 'Al-Brikan', 'Kobayashi', 'Lee', 'Ito', 'Afif', 'Yamamoto', 'Cho', 'Suzuki', 'Al-Faraj'],
};

const NATIONALITIES_BY_COUNTRY: Record<string, string[]> = {
  England: ['England', 'England', 'England', 'Scotland', 'France', 'Brazil', 'Nigeria', 'Portugal'],
  Spain: ['Spain', 'Spain', 'Spain', 'Argentina', 'Brazil', 'Uruguay', 'France', 'Morocco'],
  Italy: ['Italy', 'Italy', 'Italy', 'Argentina', 'Brazil', 'Nigeria', 'France', 'Croatia'],
  Egypt: ['Egypt', 'Egypt', 'Egypt', 'Morocco', 'Tunisia', 'Nigeria', 'South Africa'],
  Morocco: ['Morocco', 'Morocco', 'Morocco', 'Senegal', 'Ivory Coast', 'DR Congo'],
  'South Africa': ['South Africa', 'South Africa', 'South Africa', 'Zambia', 'Nigeria', 'Namibia'],
  Tunisia: ['Tunisia', 'Tunisia', 'Tunisia', 'Algeria', 'Ivory Coast', 'Mali'],
  'DR Congo': ['DR Congo', 'DR Congo', 'DR Congo', 'Tanzania', 'Zambia', 'Cameroon'],
  Tanzania: ['Tanzania', 'Tanzania', 'Tanzania', 'DR Congo', 'Zambia', 'Kenya'],
  Nigeria: ['Nigeria', 'Nigeria', 'Nigeria', 'Ghana', 'Cameroon', 'Benin'],
  Zambia: ['Zambia', 'Zambia', 'Zambia', 'Zimbabwe', 'South Africa', 'DR Congo'],
  Brazil: ['Brazil', 'Brazil', 'Brazil', 'Argentina', 'Uruguay', 'Colombia'],
  Argentina: ['Argentina', 'Argentina', 'Argentina', 'Uruguay', 'Colombia', 'Chile'],
  Uruguay: ['Uruguay', 'Uruguay', 'Uruguay', 'Argentina', 'Brazil'],
  Japan: ['Japan', 'Japan', 'Japan', 'South Korea', 'Brazil', 'Australia'],
  'South Korea': ['South Korea', 'South Korea', 'South Korea', 'Japan', 'Brazil'],
  'Saudi Arabia': ['Saudi Arabia', 'Saudi Arabia', 'Saudi Arabia', 'Morocco', 'Brazil', 'Portugal'],
  Qatar: ['Qatar', 'Qatar', 'Qatar', 'Morocco', 'Brazil', 'Egypt'],
};

const SKIN_TONES = ['#F8D9C6', '#E8B896', '#C98C63', '#A66842', '#7B482B', '#542F1C'];
const HAIR_STYLES: PlayerAppearance['hairStyle'][] = ['SHORT', 'FADE', 'CURLY', 'BRAIDS', 'BUZZ', 'SWEEP'];
const HAIR_COLORS = ['#18181B', '#27272A', '#451A03', '#78350F', '#D97706'];
const FACE_STYLES: PlayerAppearance['faceStyle'][] = ['CLASSIC', 'BEARD', 'GOATEE', 'YOUTHFUL'];

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function seededRand(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function calculateOverall(pos: Position, attr: PlayerAttributes): number {
  let score = 0;
  switch (pos) {
    case 'GK':
      score =
        attr.goalkeeping * 0.48 +
        attr.reactions * 0.22 +
        attr.positioning * 0.14 +
        attr.jumping * 0.08 +
        attr.passing * 0.08;
      break;
    case 'CB':
      score =
        attr.marking * 0.22 +
        attr.tackling * 0.22 +
        attr.strength * 0.14 +
        attr.heading * 0.13 +
        attr.positioning * 0.13 +
        attr.jumping * 0.08 +
        attr.passing * 0.08;
      break;
    case 'LB':
    case 'RB':
      score =
        attr.speed * 0.16 +
        attr.acceleration * 0.14 +
        attr.tackling * 0.16 +
        attr.marking * 0.14 +
        attr.crossing * 0.14 +
        attr.stamina * 0.14 +
        attr.passing * 0.12;
      break;
    case 'CDM':
      score =
        attr.tackling * 0.2 +
        attr.marking * 0.18 +
        attr.passing * 0.18 +
        attr.positioning * 0.14 +
        attr.stamina * 0.12 +
        attr.strength * 0.1 +
        attr.vision * 0.08;
      break;
    case 'CM':
      score =
        attr.passing * 0.22 +
        attr.vision * 0.18 +
        attr.ballControl * 0.16 +
        attr.stamina * 0.14 +
        attr.dribbling * 0.12 +
        attr.tackling * 0.1 +
        attr.shooting * 0.08;
      break;
    case 'CAM':
      score =
        attr.vision * 0.22 +
        attr.passing * 0.2 +
        attr.dribbling * 0.18 +
        attr.ballControl * 0.16 +
        attr.shooting * 0.12 +
        attr.finishing * 0.12;
      break;
    case 'LW':
    case 'RW':
      score =
        attr.speed * 0.18 +
        attr.acceleration * 0.17 +
        attr.dribbling * 0.18 +
        attr.crossing * 0.14 +
        attr.ballControl * 0.13 +
        attr.finishing * 0.1 +
        attr.shooting * 0.1;
      break;
    case 'ST':
      score =
        attr.finishing * 0.24 +
        attr.shooting * 0.18 +
        attr.positioning * 0.15 +
        attr.speed * 0.11 +
        attr.heading * 0.1 +
        attr.ballControl * 0.12 +
        attr.strength * 0.1;
      break;
  }
  return clamp(score, 45, 96);
}

export function calculateMarketValue(overall: number, age: number, potential: number): number {
  const base = Math.pow(Math.max(1, overall - 52), 2.38) * 14500;
  const ageMult = age <= 21 ? 1.38 : age <= 26 ? 1.22 : age <= 29 ? 1.0 : age <= 32 ? 0.65 : 0.35;
  const potMult = potential > overall ? 1 + (potential - overall) * 0.03 : 1;
  return Math.max(180000, Math.round((base * ageMult * potMult) / 50000) * 50000);
}

export function getFormationSlots(formation: Formation): Position[] {
  switch (formation) {
    case '4-3-3':
      return ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CM', 'LW', 'ST', 'RW'];
    case '4-2-3-1':
      return ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'LW', 'CAM', 'RW', 'ST'];
    case '4-4-2':
      return ['GK', 'LB', 'CB', 'CB', 'RB', 'LW', 'CM', 'CM', 'RW', 'ST', 'ST'];
    case '3-5-2':
      return ['GK', 'CB', 'CB', 'CB', 'LB', 'CDM', 'CM', 'CAM', 'RB', 'ST', 'ST'];
    case '5-3-2':
      return ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'ST', 'ST'];
  }
}

export function pickPlayingStyle(pos: Position, rng: () => number): PlayingStyle {
  if (pos === 'GK') return 'Sweeper Keeper';
  if (pos === 'CB') return 'Build-Up Stopper';
  if (pos === 'LB' || pos === 'RB') return 'Attacking Full-Back';
  if (pos === 'CDM') return 'Anchor Man';
  if (pos === 'CM') return 'Box-to-Box';
  if (pos === 'CAM') return 'Creative Playmaker';
  if (pos === 'LW' || pos === 'RW') return 'Prolific Winger';
  return rng() > 0.4 ? 'Poacher' : 'Deep-Lying Forward';
}

export function generatePlayer(params: {
  id: string;
  clubId: string;
  region: Region;
  country: string;
  position: Position;
  targetOverall: number;
  shirtNumber: number;
  age?: number;
  isYouth?: boolean;
  seed: number;
}): Player {
  const rng = seededRand(params.seed);
  const fNames = FIRST_NAMES_BY_REGION[params.region];
  const lNames = LAST_NAMES_BY_REGION[params.region];
  const rawFirst = fNames[Math.floor(rng() * fNames.length)];
  const first = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1);
  const last = lNames[Math.floor(rng() * lNames.length)];
  const nats = NATIONALITIES_BY_COUNTRY[params.country] ?? [params.country];
  const nationality = nats[Math.floor(rng() * nats.length)];
  const age = params.age ?? (params.isYouth ? 17 + Math.floor(rng() * 3) : 19 + Math.floor(rng() * 14));
  const base = params.targetOverall;
  const jitter = () => Math.floor((rng() - 0.5) * 12);

  const isGK = params.position === 'GK';
  const isDef = ['CB', 'LB', 'RB', 'CDM'].includes(params.position);
  const isAtt = ['ST', 'LW', 'RW', 'CAM'].includes(params.position);
  const isWide = ['LB', 'RB', 'LW', 'RW'].includes(params.position);

  const attributes: PlayerAttributes = {
    speed: clamp(base + (isWide ? 7 : isGK ? -24 : isAtt ? 4 : -2) + jitter(), 30, 97),
    acceleration: clamp(base + (isWide ? 8 : isGK ? -24 : isAtt ? 4 : -2) + jitter(), 30, 97),
    shooting: clamp(base + (isAtt ? 6 : isDef ? -15 : isGK ? -38 : 0) + jitter(), 25, 96),
    finishing: clamp(base + (params.position === 'ST' ? 8 : isAtt ? 4 : isDef ? -18 : isGK ? -42 : -4) + jitter(), 20, 97),
    passing: clamp(base + (['CM', 'CAM', 'CDM'].includes(params.position) ? 7 : isGK ? -12 : -2) + jitter(), 35, 96),
    vision: clamp(base + (['CAM', 'CM'].includes(params.position) ? 7 : isDef ? -10 : isGK ? -20 : 0) + jitter(), 30, 96),
    dribbling: clamp(base + (isAtt || params.position === 'CM' ? 6 : isDef ? -12 : isGK ? -38 : 0) + jitter(), 25, 97),
    ballControl: clamp(base + (isAtt || ['CM', 'CAM'].includes(params.position) ? 6 : isGK ? -30 : -4) + jitter(), 30, 96),
    crossing: clamp(base + (isWide ? 8 : isGK ? -40 : -8) + jitter(), 20, 95),
    tackling: clamp(base + (isDef ? 8 : isAtt ? -24 : isGK ? -42 : -4) + jitter(), 20, 96),
    marking: clamp(base + (isDef ? 8 : isAtt ? -26 : isGK ? -42 : -6) + jitter(), 20, 96),
    strength: clamp(base + (['CB', 'ST', 'CDM'].includes(params.position) ? 6 : -3) + jitter(), 38, 96),
    stamina: clamp(base + (['CM', 'LB', 'RB', 'CDM'].includes(params.position) ? 6 : isGK ? -18 : 0) + jitter(), 45, 97),
    jumping: clamp(base + (['CB', 'ST', 'GK'].includes(params.position) ? 6 : -4) + jitter(), 40, 96),
    heading: clamp(base + (['CB', 'ST'].includes(params.position) ? 7 : isGK ? -35 : -8) + jitter(), 25, 96),
    positioning: clamp(base + (['ST', 'CB', 'CDM', 'GK'].includes(params.position) ? 6 : 0) + jitter(), 38, 96),
    reactions: clamp(base + 2 + jitter(), 45, 96),
    goalkeeping: clamp(isGK ? base + 4 + Math.floor((rng() - 0.5) * 6) : 14 + Math.floor(rng() * 12), 10, 96),
  };

  const overall = calculateOverall(params.position, attributes);
  const potential = clamp(
    age <= 22 ? overall + 5 + Math.floor(rng() * 11) : age <= 26 ? overall + Math.floor(rng() * 4) : overall,
    overall,
    95
  );
  const marketValue = calculateMarketValue(overall, age, potential);
  const weeklyWage = Math.max(2500, Math.round((marketValue * 0.0022) / 500) * 500);

  const skinIdx =
    params.region === 'AFRICA'
      ? 3 + Math.floor(rng() * 3)
      : params.region === 'ASIA'
      ? 1 + Math.floor(rng() * 2)
      : params.region === 'SOUTH_AMERICA'
      ? 1 + Math.floor(rng() * 4)
      : Math.floor(rng() * 4);

  const appearance: PlayerAppearance = {
    skinTone: SKIN_TONES[Math.min(SKIN_TONES.length - 1, skinIdx)],
    hairStyle: HAIR_STYLES[Math.floor(rng() * HAIR_STYLES.length)],
    hairColor: params.region === 'EUROPE' ? HAIR_COLORS[Math.floor(rng() * HAIR_COLORS.length)] : HAIR_COLORS[Math.floor(rng() * 2)],
    faceStyle: age <= 20 ? 'YOUTHFUL' : FACE_STYLES[Math.floor(rng() * FACE_STYLES.length)],
  };

  const secondaryMap: Record<Position, Position[]> = {
    GK: [],
    CB: ['CDM'],
    LB: ['LW', 'CB'],
    RB: ['RW', 'CB'],
    CDM: ['CM', 'CB'],
    CM: ['CDM', 'CAM'],
    CAM: ['CM', 'LW', 'RW'],
    LW: ['RW', 'ST', 'CAM'],
    RW: ['LW', 'ST', 'CAM'],
    ST: ['LW', 'RW'],
  };

  return {
    id: params.id,
    name: `${first} ${last}`,
    nationality,
    age,
    heightCm: isGK || params.position === 'CB' ? 184 + Math.floor(rng() * 11) : 171 + Math.floor(rng() * 15),
    weightKg: 68 + Math.floor(rng() * 18),
    preferredFoot: rng() > 0.78 ? 'Left' : rng() > 0.9 ? 'Both' : 'Right',
    position: params.position,
    secondaryPositions: secondaryMap[params.position],
    shirtNumber: params.shirtNumber,
    playingStyle: pickPlayingStyle(params.position, rng),
    appearance,
    attributes,
    overall,
    potential,
    form: 65 + Math.floor(rng() * 22),
    sharpness: 75 + Math.floor(rng() * 20),
    fitness: 90 + Math.floor(rng() * 10),
    morale: 74 + Math.floor(rng() * 18),
    confidence: 70 + Math.floor(rng() * 20),
    reputation: clamp(overall - 6 + Math.floor(rng() * 10), 40, 96),
    marketValue,
    weeklyWage,
    contractYears: 1 + Math.floor(rng() * 4),
    releaseClause: Math.round((marketValue * 1.65) / 100000) * 100000,
    clubId: params.clubId,
    isYouth: params.isYouth,
    injuredWeeks: 0,
    suspendedMatches: 0,
    scouted: false,
    seasonStats: {
      appearances: 0,
      starts: 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0,
      averageRating: 0,
      ratingCount: 0,
      motm: 0,
    },
    internationalCaps: overall >= 79 ? Math.floor(rng() * 28) : 0,
    internationalGoals: overall >= 79 && isAtt ? Math.floor(rng() * 10) : 0,
    careerHistory: [],
  };
}

export function generateRoundRobinFixtures(
  leagueId: string,
  leagueName: string,
  clubIds: string[]
): Fixture[] {
  const n = clubIds.length;
  const teams = [...clubIds];
  const fixtures: Fixture[] = [];
  const rounds = n - 1;

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < n / 2; i++) {
      const t1 = teams[i];
      const t2 = teams[n - 1 - i];
      const homeFirst = (r + i) % 2 === 0;
      const h1 = homeFirst ? t1 : t2;
      const a1 = homeFirst ? t2 : t1;
      fixtures.push({
        id: `${leagueId}_r${r + 1}_${i}`,
        competitionId: leagueId,
        competitionName: leagueName,
        competitionType: 'LEAGUE',
        round: r + 1,
        week: r + 1,
        homeClubId: h1,
        awayClubId: a1,
        played: false,
        homeGoals: 0,
        awayGoals: 0,
      });
      fixtures.push({
        id: `${leagueId}_r${r + 1 + rounds}_${i}`,
        competitionId: leagueId,
        competitionName: leagueName,
        competitionType: 'LEAGUE',
        round: r + 1 + rounds,
        week: r + 1 + rounds,
        homeClubId: a1,
        awayClubId: h1,
        played: false,
        homeGoals: 0,
        awayGoals: 0,
      });
    }
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }
  return fixtures.sort((a, b) => a.week - b.week);
}

export function buildWorldDatabase(): {
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  leagues: Record<string, League>;
  nationalTeams: Record<string, NationalTeam>;
} {
  const clubs: Record<string, Club> = {};
  const players: Record<string, Player> = {};
  const leagues: Record<string, League> = {};
  const nationalTeams: Record<string, NationalTeam> = {};

  let seedCounter = 104729;

  for (const lb of LEAGUE_BLUEPRINTS) {
    const clubIds: string[] = [];

    for (const cb of lb.clubs) {
      clubIds.push(cb.id);
      const squadPositions: Position[] = [
        'GK',
        'GK',
        'CB',
        'CB',
        'CB',
        'LB',
        'RB',
        'CDM',
        'CM',
        'CM',
        'CAM',
        'LW',
        'RW',
        'ST',
        'ST',
        'LB',
        'CM',
        'ST',
      ];
      const clubPlayerIds: string[] = [];
      let totalWage = 0;

      squadPositions.forEach((pos, idx) => {
        seedCounter += 7919;
        const isStarterTier = idx < 13;
        const targetOvr = clamp(
          cb.reputation - (isStarterTier ? 3 : 8) + ((idx * 3) % 7) - 3,
          64,
          91
        );
        const p = generatePlayer({
          id: `${cb.id}_p${idx + 1}`,
          clubId: cb.id,
          region: lb.region,
          country: cb.country === 'Pan-Africa' ? 'Egypt' : cb.country,
          position: pos,
          targetOverall: targetOvr,
          shirtNumber: idx + 1,
          isYouth: idx >= 16,
          seed: seedCounter,
        });
        players[p.id] = p;
        clubPlayerIds.push(p.id);
        totalWage += p.weeklyWage;
      });

      const slots = getFormationSlots(cb.formation);
      const used = new Set<string>();
      const startingXI: string[] = [];

      slots.forEach((slotPos) => {
        const best = clubPlayerIds
          .filter((pid) => !used.has(pid))
          .sort((a, b) => {
            const pa = players[a];
            const pb = players[b];
            const aMatch = pa.position === slotPos ? 15 : pa.secondaryPositions.includes(slotPos) ? 6 : -10;
            const bMatch = pb.position === slotPos ? 15 : pb.secondaryPositions.includes(slotPos) ? 6 : -10;
            return pb.overall + bMatch - (pa.overall + aMatch);
          })[0];
        if (best) {
          used.add(best);
          startingXI.push(best);
        }
      });

      const bench = clubPlayerIds.filter((pid) => !used.has(pid)).slice(0, 7);
      const tactics: ClubTactics = {
        formation: cb.formation,
        mentality: cb.reputation >= 84 ? 'ATTACKING' : 'BALANCED',
        pressing: cb.reputation >= 82 ? 'GEGENPRESS' : 'MID_PRESS',
        passing: lb.region === 'SOUTH_AMERICA' || cb.country === 'Spain' ? 'SHORT_TIKI_TAKA' : 'MIXED',
        tempo: 62,
        startingXI,
        bench,
        captainId: startingXI[2] || startingXI[0],
      };

      const transferBudget = Math.round((Math.pow(cb.reputation - 60, 2.2) * 42000) / 100000) * 100000;
      const targetPosition = cb.reputation >= 86 ? 2 : cb.reputation >= 81 ? 4 : 6;

      clubs[cb.id] = {
        id: cb.id,
        name: cb.name,
        shortName: cb.shortName,
        country: cb.country,
        region: lb.region,
        leagueId: lb.id,
        primaryColor: cb.primaryColor,
        secondaryColor: cb.secondaryColor,
        reputation: cb.reputation,
        stadiumName: cb.stadiumName,
        stadiumCapacity: cb.stadiumCapacity,
        tactics,
        finances: {
          transferBudget,
          wageBudgetWeekly: Math.round(totalWage * 1.25),
          weeklyWageBill: totalWage,
          cashBalance: transferBudget * 1.8,
          matchdayIncomePerHomeGame: Math.round(cb.stadiumCapacity * 32),
          sponsorAnnualIncome: Math.round(transferBudget * 0.65),
        },
        chemistry: 72 + (cb.reputation % 14),
        boardExpectation:
          targetPosition <= 2
            ? 'Challenge for the league title & Continental glory'
            : targetPosition <= 4
            ? 'Qualify for the Continental Champions Cup'
            : 'Secure a solid mid-table finish & develop squad value',
        targetPosition,
      };
    }

    leagues[lb.id] = {
      id: lb.id,
      name: lb.name,
      country: lb.country,
      region: lb.region,
      tier: lb.tier,
      clubIds,
      standings: clubIds.map((id) => ({
        clubId: id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      })),
      fixtures: generateRoundRobinFixtures(lb.id, lb.name, clubIds),
    };
  }

  for (const nt of NATIONAL_TEAM_BLUEPRINTS) {
    const matchingPlayers = Object.values(players)
      .filter((p) => p.nationality === nt.name)
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 18)
      .map((p) => p.id);

    // Ensure every national team has at least 16 players (generate domestic stars if needed)
    const slots: Position[] = ['GK', 'GK', 'CB', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'ST', 'CM'];
    let extraIdx = 0;
    while (matchingPlayers.length < 16) {
      seedCounter += 3571;
      const pos = slots[extraIdx % slots.length];
      const p = generatePlayer({
        id: `${nt.id}_nat_${extraIdx}`,
        clubId: 'free_agent',
        region: nt.region,
        country: nt.name,
        position: pos,
        targetOverall: Math.max(68, nt.reputation - 8 + (extraIdx % 5)),
        shirtNumber: extraIdx + 1,
        seed: seedCounter,
      });
      p.nationality = nt.name;
      players[p.id] = p;
      matchingPlayers.push(p.id);
      extraIdx++;
    }

    nationalTeams[nt.id] = {
      id: nt.id,
      name: nt.name,
      code: nt.code,
      region: nt.region,
      primaryColor: nt.primaryColor,
      secondaryColor: nt.secondaryColor,
      rankingPoints: 1850 - nt.worldRank * 14,
      worldRank: nt.worldRank,
      reputation: nt.reputation,
      formation: nt.formation,
      squadPlayerIds: matchingPlayers,
    };
  }

  return { clubs, players, leagues, nationalTeams };
}
