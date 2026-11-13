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


function makeAdditionalMajorClubs(
  leagueId: string,
  country: string,
  entries: Array<[string, string, string, string, string, number]>
): ClubBlueprint[] {
  return entries.map(([id, name, shortName, primaryColor, secondaryColor, reputation]) => ({
    id: leagueId + '_' + id, name, shortName, country, primaryColor, secondaryColor, reputation,
    stadiumName: name + ' Stadium', stadiumCapacity: 25000, formation: '4-3-3',
  }));
}

export const LEAGUE_BLUEPRINTS: LeagueBlueprint[] = [
  {
    id: 'eng_prem',
    name: 'English Premier Division',
    country: 'England',
    region: 'EUROPE',
    tier: 1,
    clubs: [...[
      { id: 'man_sky', name: 'Manchester City', shortName: 'MCY', country: 'England', primaryColor: '#38BDF8', secondaryColor: '#FFFFFF', reputation: 91, stadiumName: 'Eastlands Arena', stadiumCapacity: 53400, formation: '4-3-3' },
      { id: 'north_gunners', name: 'Arsenal', shortName: 'NLG', country: 'England', primaryColor: '#EF4444', secondaryColor: '#FFFFFF', reputation: 88, stadiumName: 'Highbury Dome', stadiumCapacity: 60700, formation: '4-3-3' },
      { id: 'mersey_reds', name: 'Liverpool', shortName: 'MSR', country: 'England', primaryColor: '#DC2626', secondaryColor: '#FACC15', reputation: 89, stadiumName: 'Anfield Park', stadiumCapacity: 61200, formation: '4-2-3-1' },
      { id: 'west_blues', name: 'Chelsea', shortName: 'WLB', country: 'England', primaryColor: '#2563EB', secondaryColor: '#FFFFFF', reputation: 85, stadiumName: 'Stamford Bridge Ground', stadiumCapacity: 40300, formation: '4-2-3-1' },
      { id: 'man_red', name: 'Manchester United', shortName: 'MNU', country: 'England', primaryColor: '#B91C1C', secondaryColor: '#111827', reputation: 86, stadiumName: 'Trafford Theatre', stadiumCapacity: 74300, formation: '4-2-3-1' },
      { id: 'tyne_magpies', name: 'Newcastle United', shortName: 'TYN', country: 'England', primaryColor: '#1F2937', secondaryColor: '#F8FAFC', reputation: 81, stadiumName: 'St. James Bowl', stadiumCapacity: 52300, formation: '4-3-3' },
      { id: 'birm_villa', name: 'Aston Villa', shortName: 'MVL', country: 'England', primaryColor: '#7C2D12', secondaryColor: '#38BDF8', reputation: 79, stadiumName: 'Aston Ground', stadiumCapacity: 42600, formation: '4-4-2' },
      { id: 'spurs_lily', name: 'Tottenham Hotspur', shortName: 'TOT', country: 'England', primaryColor: '#F8FAFC', secondaryColor: '#1E293B', reputation: 82, stadiumName: 'White Hart Bowl', stadiumCapacity: 62800, formation: '4-3-3' },
    ], ...makeAdditionalMajorClubs('eng_prem', 'England', [["bou","AFC Bournemouth","BOU","#DC2626","#111827",76],["bre","Brentford","BRE","#DC2626","#FFFFFF",77],["bha","Brighton & Hove Albion","BHA","#1D4ED8","#FFFFFF",79],["cov","Coventry City","COV","#1D4ED8","#FFFFFF",73],["crp","Crystal Palace","CRY","#1D4ED8","#DC2626",77],["eve","Everton","EVE","#1D4ED8","#FFFFFF",78],["ful","Fulham","FUL","#F8FAFC","#111827",76],["hul","Hull City","HUL","#F97316","#111827",71],["ips","Ipswich Town","IPS","#2563EB","#FFFFFF",72],["lee","Leeds United","LEE","#F8FAFC","#FACC15",77],["nfo","Nottingham Forest","NFO","#DC2626","#FFFFFF",78],["sun","Sunderland","SUN","#DC2626","#FFFFFF",74]])]],
  },
  {
    id: 'esp_liga',
    name: 'Iberia Primera',
    country: 'Spain',
    region: 'EUROPE',
    tier: 1,
    clubs: [...[
      { id: 'real_castilla', name: 'Real Madrid', shortName: 'RCS', country: 'Spain', primaryColor: '#F8FAFC', secondaryColor: '#F59E0B', reputation: 93, stadiumName: 'Chamartin Coliseum', stadiumCapacity: 81000, formation: '4-3-3' },
      { id: 'catalunya_blau', name: 'FC Barcelona', shortName: 'CAT', country: 'Spain', primaryColor: '#1D4ED8', secondaryColor: '#B91C1C', reputation: 90, stadiumName: 'Nou Estadi', stadiumCapacity: 89000, formation: '4-3-3' },
      { id: 'atleti_madrid', name: 'Atlético de Madrid', shortName: 'ATC', country: 'Spain', primaryColor: '#DC2626', secondaryColor: '#F8FAFC', reputation: 86, stadiumName: 'Metropolitano Norte', stadiumCapacity: 70400, formation: '5-3-2' },
      { id: 'basque_lions', name: 'Athletic Club', shortName: 'BIL', country: 'Spain', primaryColor: '#E11D48', secondaryColor: '#111827', reputation: 80, stadiumName: 'San Mames Cathedral', stadiumCapacity: 53300, formation: '4-2-3-1' },
      { id: 'sevilla_nervion', name: 'Sevilla FC', shortName: 'SEV', country: 'Spain', primaryColor: '#F1F5F9', secondaryColor: '#DC2626', reputation: 79, stadiumName: 'Pizjuan Ground', stadiumCapacity: 43800, formation: '4-3-3' },
      { id: 'valencia_bats', name: 'Valencia CF', shortName: 'VAL', country: 'Spain', primaryColor: '#F8FAFC', secondaryColor: '#F97316', reputation: 77, stadiumName: 'Mestalla Arena', stadiumCapacity: 49400, formation: '4-4-2' },
      { id: 'sociedad_blue', name: 'Real Sociedad', shortName: 'SSB', country: 'Spain', primaryColor: '#0284C7', secondaryColor: '#FFFFFF', reputation: 80, stadiumName: 'Anoeta Park', stadiumCapacity: 39500, formation: '4-3-3' },
      { id: 'villarreal_sub', name: 'Villarreal CF', shortName: 'VIL', country: 'Spain', primaryColor: '#EAB308', secondaryColor: '#1E3A8A', reputation: 78, stadiumName: 'El Madrigal', stadiumCapacity: 23500, formation: '4-4-2' },
    ], ...makeAdditionalMajorClubs('esp_liga', 'Spain', [["osa","CA Osasuna","OSA","#DC2626","#1E293B",76],["cel","Celta de Vigo","CEL","#38BDF8","#FFFFFF",77],["ala","Deportivo Alavés","ALA","#1D4ED8","#FFFFFF",75],["elc","Elche CF","ELC","#16A34A","#FFFFFF",73],["get","Getafe CF","GET","#1D4ED8","#FFFFFF",75],["lev","Levante UD","LEV","#DC2626","#1D4ED8",74],["mal","Málaga CF","MAL","#1D4ED8","#FFFFFF",72],["rac","Racing Santander","RAC","#16A34A","#FFFFFF",72],["ray","Rayo Vallecano","RAY","#F8FAFC","#DC2626",75],["dep","RC Deportivo","DEP","#1D4ED8","#FFFFFF",74],["esp","RCD Espanyol","ESP","#1D4ED8","#FFFFFF",75],["bet","Real Betis","BET","#16A34A","#FFFFFF",81]])]],
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
    clubs: [...[
      { id: 'milano_nerazzurri', name: 'Inter Milan', shortName: 'INT', country: 'Italy', primaryColor: '#1D4ED8', secondaryColor: '#0F172A', reputation: 89, stadiumName: 'Giuseppe Meazza', stadiumCapacity: 75800, formation: '3-5-2' },
      { id: 'milano_rossoneri', name: 'AC Milan', shortName: 'ACM', country: 'Italy', primaryColor: '#DC2626', secondaryColor: '#0F172A', reputation: 86, stadiumName: 'San Siro', stadiumCapacity: 75800, formation: '4-2-3-1' },
      { id: 'torino_zebre', name: 'Juventus', shortName: 'TOR', country: 'Italy', primaryColor: '#F8FAFC', secondaryColor: '#111827', reputation: 86, stadiumName: 'Piedmont Stadium', stadiumCapacity: 41500, formation: '3-5-2' },
      { id: 'napoli_azzurri', name: 'Napoli', shortName: 'NAP', country: 'Italy', primaryColor: '#0EA5E9', secondaryColor: '#FFFFFF', reputation: 84, stadiumName: 'Stadio Vesuvio', stadiumCapacity: 54700, formation: '4-3-3' },
      { id: 'roma_gladiators', name: 'AS Roma', shortName: 'ROM', country: 'Italy', primaryColor: '#991B1B', secondaryColor: '#F59E0B', reputation: 82, stadiumName: 'Olimpico Roma', stadiumCapacity: 70600, formation: '3-5-2' },
      { id: 'bergamo_dea', name: 'Atalanta', shortName: 'ATA', country: 'Italy', primaryColor: '#1E40AF', secondaryColor: '#111827', reputation: 81, stadiumName: 'Gewiss Ground', stadiumCapacity: 24900, formation: '3-5-2' },
      { id: 'lazio_eagles', name: 'Lazio', shortName: 'LAZ', country: 'Italy', primaryColor: '#7DD3FC', secondaryColor: '#FFFFFF', reputation: 79, stadiumName: 'Olimpico Nord', stadiumCapacity: 70600, formation: '4-3-3' },
      { id: 'firenze_viola', name: 'Fiorentina', shortName: 'FIO', country: 'Italy', primaryColor: '#7C3AED', secondaryColor: '#FFFFFF', reputation: 78, stadiumName: 'Artemio Franchi', stadiumCapacity: 43100, formation: '4-2-3-1' },
    ], ...makeAdditionalMajorClubs('ita_serie', 'Italy', [["mon","AC Monza","MON","#DC2626","#FFFFFF",73],["bol","Bologna FC","BOL","#DC2626","#1E293B",80],["cag","Cagliari","CAG","#DC2626","#1D4ED8",74],["com","Como 1907","COM","#38BDF8","#FFFFFF",78],["fro","Frosinone Calcio","FRO","#FACC15","#1D4ED8",72],["gen","Genoa CFC","GEN","#DC2626","#1D4E8A",76],["par","Parma","PAR","#F8FAFC","#FACC15",75],["sas","Sassuolo","SAS","#16A34A","#111827",75],["tor","Torino FC","TOR","#DC2626","#FFFFFF",77],["udi","Udinese","UDI","#111827","#F8FAFC",76],["lec","US Lecce","LEC","#FACC15","#DC2626",73],["ven","Venezia FC","VEN","#F97316","#111827",72]])]],
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
  {
    id: 'fra_ligue1', name: 'French Ligue 1', country: 'France', region: 'EUROPE', tier: 1,
    clubs: [...[
      { id: 'fra_ligue1_1', name: 'Paris Saint-Germain', shortName: 'PSG', country: 'France', primaryColor: '#1D4ED8', secondaryColor: '#E11D48', reputation: 92, stadiumName: 'Parc des Princes', stadiumCapacity: 47900, formation: '4-3-3' },
      { id: 'fra_ligue1_2', name: 'Olympique Marseille', shortName: 'OM', country: 'France', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 85, stadiumName: 'Stade Velodrome', stadiumCapacity: 67300, formation: '4-2-3-1' },
      { id: 'fra_ligue1_3', name: 'AS Monaco', shortName: 'ASM', country: 'France', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 83, stadiumName: 'Stade Louis II', stadiumCapacity: 18500, formation: '4-4-2' },
      { id: 'fra_ligue1_4', name: 'Olympique Lyonnais', shortName: 'OL', country: 'France', primaryColor: '#1D4ED8', secondaryColor: '#DC2626', reputation: 82, stadiumName: 'Groupama Stadium', stadiumCapacity: 59186, formation: '3-5-2' },
      { id: 'fra_ligue1_5', name: 'Lille OSC', shortName: 'LIL', country: 'France', primaryColor: '#DC2626', secondaryColor: '#1E3A8A', reputation: 80, stadiumName: 'Stade Pierre-Mauroy', stadiumCapacity: 50186, formation: '4-3-3' },
      { id: 'fra_ligue1_6', name: 'OGC Nice', shortName: 'NIC', country: 'France', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 78, stadiumName: 'Allianz Riviera', stadiumCapacity: 36178, formation: '4-2-3-1' },
      { id: 'fra_ligue1_7', name: 'Stade Rennais', shortName: 'REN', country: 'France', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 78, stadiumName: 'Roazhon Park', stadiumCapacity: 29778, formation: '4-4-2' },
      { id: 'fra_ligue1_8', name: 'RC Lens', shortName: 'LEN', country: 'France', primaryColor: '#FACC15', secondaryColor: '#DC2626', reputation: 77, stadiumName: 'Stade Bollaert-Delelis', stadiumCapacity: 38223, formation: '3-5-2' }
    ], ...makeAdditionalMajorClubs('fra_ligue1', 'France', [["angers","Angers SCO","ANG","#111827","#FFFFFF",73],["auxerre","AJ Auxerre","AUX","#1D4ED8","#FFFFFF",73],["troyes","ESTAC Troyes","TRO","#1D4ED8","#FFFFFF",71],["lehavre","Le Havre AC","HAC","#1D4E8A","#FFFFFF",73],["lemans","Le Mans FC","LEM","#DC2626","#F8FAFC",70],["lorient","FC Lorient","LOR","#F97316","#111827",73],["parisfc","Paris FC","PFC","#1D4ED8","#DC2626",74],["brest","Stade Brestois 29","BRE","#DC2626","#FFFFFF",75],["strasbourg","RC Strasbourg Alsace","STR","#1D4ED8","#FFFFFF",77],["toulouse","Toulouse FC","TFC","#7C3AED","#FFFFFF",75]])]],
  },
  {
    id: 'ger_bundesliga', name: 'German Bundesliga', country: 'Germany', region: 'EUROPE', tier: 1,
    clubs: [...[
      { id: 'ger_bundesliga_1', name: 'Bayern Munich', shortName: 'BAY', country: 'Germany', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 93, stadiumName: 'Allianz Arena', stadiumCapacity: 75000, formation: '4-2-3-1' },
      { id: 'ger_bundesliga_2', name: 'Borussia Dortmund', shortName: 'BVB', country: 'Germany', primaryColor: '#FDE047', secondaryColor: '#111827', reputation: 88, stadiumName: 'Signal Iduna Park', stadiumCapacity: 81365, formation: '4-4-2' },
      { id: 'ger_bundesliga_3', name: 'Bayer Leverkusen', shortName: 'B04', country: 'Germany', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 86, stadiumName: 'BayArena', stadiumCapacity: 30210, formation: '3-5-2' },
      { id: 'ger_bundesliga_4', name: 'RB Leipzig', shortName: 'RBL', country: 'Germany', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 84, stadiumName: 'Red Bull Arena', stadiumCapacity: 47069, formation: '4-3-3' },
      { id: 'ger_bundesliga_5', name: 'Eintracht Frankfurt', shortName: 'SGE', country: 'Germany', primaryColor: '#111827', secondaryColor: '#FFFFFF', reputation: 81, stadiumName: 'Deutsche Bank Park', stadiumCapacity: 58000, formation: '4-2-3-1' },
      { id: 'ger_bundesliga_6', name: 'VfB Stuttgart', shortName: 'VFB', country: 'Germany', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 80, stadiumName: 'MHPArena', stadiumCapacity: 60449, formation: '4-4-2' },
      { id: 'ger_bundesliga_7', name: 'SC Freiburg', shortName: 'SCF', country: 'Germany', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 78, stadiumName: 'Europa-Park Stadion', stadiumCapacity: 34700, formation: '3-5-2' },
      { id: 'ger_bundesliga_8', name: 'Borussia Monchengladbach', shortName: 'BMG', country: 'Germany', primaryColor: '#16A34A', secondaryColor: '#111827', reputation: 78, stadiumName: 'Borussia-Park', stadiumCapacity: 54057, formation: '4-3-3' }
    ], ...makeAdditionalMajorClubs('ger_bundesliga', 'Germany', [["augs","FC Augsburg","FCA","#16A34A","#FFFFFF",75],["mainz","1. FSV Mainz 05","M05","#DC2626","#FFFFFF",76],["union","1. FC Union Berlin","FCU","#DC2626","#F8FAFC",77],["hsv","Hamburger SV","HSV","#1D4ED8","#FFFFFF",77],["koln","1. FC Köln","KOE","#DC2626","#FFFFFF",75],["werder","SV Werder Bremen","SVW","#16A34A","#FFFFFF",77],["schalke","FC Schalke 04","S04","#1D4ED8","#FFFFFF",78],["elversberg","SV Elversberg","SVE","#111827","#FFFFFF",70],["paderborn","SC Paderborn 07","SCP","#1D4ED8","#111827",71],["hoffenheim","TSG Hoffenheim","TSG","#1D4ED8","#FFFFFF",77]])]],
  },
  {
    id: 'por_primeira', name: 'Portuguese Primeira Liga', country: 'Portugal', region: 'EUROPE', tier: 1,
    clubs: [
      { id: 'por_primeira_1', name: 'Benfica', shortName: 'SLB', country: 'Portugal', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 87, stadiumName: 'Estadio da Luz', stadiumCapacity: 64642, formation: '4-4-2' },
      { id: 'por_primeira_2', name: 'FC Porto', shortName: 'FCP', country: 'Portugal', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 87, stadiumName: 'Estadio do Dragao', stadiumCapacity: 50033, formation: '3-5-2' },
      { id: 'por_primeira_3', name: 'Sporting CP', shortName: 'SCP', country: 'Portugal', primaryColor: '#16A34A', secondaryColor: '#FFFFFF', reputation: 86, stadiumName: 'Estadio Jose Alvalade', stadiumCapacity: 50095, formation: '4-3-3' },
      { id: 'por_primeira_4', name: 'SC Braga', shortName: 'BRA', country: 'Portugal', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 80, stadiumName: 'Estadio Municipal de Braga', stadiumCapacity: 30286, formation: '4-2-3-1' },
      { id: 'por_primeira_5', name: 'Vitoria SC', shortName: 'VSC', country: 'Portugal', primaryColor: '#111827', secondaryColor: '#FFFFFF', reputation: 76, stadiumName: 'Estadio D Afonso Henriques', stadiumCapacity: 30000, formation: '4-4-2' },
      { id: 'por_primeira_6', name: 'Boavista FC', shortName: 'BOA', country: 'Portugal', primaryColor: '#111827', secondaryColor: '#FFFFFF', reputation: 73, stadiumName: 'Estadio do Bessa', stadiumCapacity: 28263, formation: '3-5-2' },
      { id: 'por_primeira_7', name: 'Famalicao', shortName: 'FAM', country: 'Portugal', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 72, stadiumName: 'Estadio Municipal de Famalicao', stadiumCapacity: 5307, formation: '4-3-3' },
      { id: 'por_primeira_8', name: 'Moreirense FC', shortName: 'MFC', country: 'Portugal', primaryColor: '#16A34A', secondaryColor: '#111827', reputation: 70, stadiumName: 'Parque de Jogos Comendador Joaquim', stadiumCapacity: 6150, formation: '4-2-3-1' }
    ],
  },
  {
    id: 'ned_eredivisie', name: 'Dutch Eredivisie', country: 'Netherlands', region: 'EUROPE', tier: 1,
    clubs: [
      { id: 'ned_eredivisie_1', name: 'Ajax', shortName: 'AJA', country: 'Netherlands', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 86, stadiumName: 'Johan Cruyff Arena', stadiumCapacity: 55600, formation: '3-5-2' },
      { id: 'ned_eredivisie_2', name: 'PSV Eindhoven', shortName: 'PSV', country: 'Netherlands', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 85, stadiumName: 'Philips Stadion', stadiumCapacity: 35000, formation: '4-3-3' },
      { id: 'ned_eredivisie_3', name: 'Feyenoord', shortName: 'FEY', country: 'Netherlands', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 84, stadiumName: 'De Kuip', stadiumCapacity: 47500, formation: '4-2-3-1' },
      { id: 'ned_eredivisie_4', name: 'AZ Alkmaar', shortName: 'AZ', country: 'Netherlands', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 78, stadiumName: 'AFAS Stadion', stadiumCapacity: 19478, formation: '4-4-2' },
      { id: 'ned_eredivisie_5', name: 'FC Twente', shortName: 'TWE', country: 'Netherlands', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 77, stadiumName: 'De Grolsch Veste', stadiumCapacity: 30205, formation: '3-5-2' },
      { id: 'ned_eredivisie_6', name: 'FC Utrecht', shortName: 'UTR', country: 'Netherlands', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 75, stadiumName: 'Stadion Galgenwaard', stadiumCapacity: 23750, formation: '4-3-3' },
      { id: 'ned_eredivisie_7', name: 'Go Ahead Eagles', shortName: 'GAE', country: 'Netherlands', primaryColor: '#DC2626', secondaryColor: '#FACC15', reputation: 72, stadiumName: 'De Adelaarshorst', stadiumCapacity: 10000, formation: '4-2-3-1' },
      { id: 'ned_eredivisie_8', name: 'SC Heerenveen', shortName: 'HEE', country: 'Netherlands', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 72, stadiumName: 'Abe Lenstra Stadion', stadiumCapacity: 26100, formation: '4-4-2' }
    ],
  },
  {
    id: 'sco_prem', name: 'Scottish Premiership', country: 'Scotland', region: 'EUROPE', tier: 1,
    clubs: [
      { id: 'sco_prem_1', name: 'Celtic', shortName: 'CEL', country: 'Scotland', primaryColor: '#16A34A', secondaryColor: '#FFFFFF', reputation: 83, stadiumName: 'Celtic Park', stadiumCapacity: 60411, formation: '4-3-3' },
      { id: 'sco_prem_2', name: 'Rangers', shortName: 'RAN', country: 'Scotland', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 83, stadiumName: 'Ibrox Stadium', stadiumCapacity: 50817, formation: '4-2-3-1' },
      { id: 'sco_prem_3', name: 'Heart of Midlothian', shortName: 'HEA', country: 'Scotland', primaryColor: '#7C2D12', secondaryColor: '#FFFFFF', reputation: 74, stadiumName: 'Tynecastle Park', stadiumCapacity: 20099, formation: '4-4-2' },
      { id: 'sco_prem_4', name: 'Aberdeen', shortName: 'ABE', country: 'Scotland', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 73, stadiumName: 'Pittodrie Stadium', stadiumCapacity: 20866, formation: '3-5-2' },
      { id: 'sco_prem_5', name: 'Hibernian', shortName: 'HIB', country: 'Scotland', primaryColor: '#16A34A', secondaryColor: '#FFFFFF', reputation: 72, stadiumName: 'Easter Road', stadiumCapacity: 20421, formation: '4-3-3' },
      { id: 'sco_prem_6', name: 'Dundee United', shortName: 'DUU', country: 'Scotland', primaryColor: '#F97316', secondaryColor: '#111827', reputation: 70, stadiumName: 'Tannadice Park', stadiumCapacity: 14223, formation: '4-2-3-1' },
      { id: 'sco_prem_7', name: 'Motherwell', shortName: 'MOT', country: 'Scotland', primaryColor: '#FACC15', secondaryColor: '#DC2626', reputation: 69, stadiumName: 'Fir Park', stadiumCapacity: 13742, formation: '4-4-2' },
      { id: 'sco_prem_8', name: 'Kilmarnock', shortName: 'KIL', country: 'Scotland', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 68, stadiumName: 'Rugby Park', stadiumCapacity: 18128, formation: '3-5-2' }
    ],
  },
  {
    id: 'tur_superlig', name: 'Turkish Super Lig', country: 'Turkey', region: 'EUROPE', tier: 1,
    clubs: [
      { id: 'tur_superlig_1', name: 'Galatasaray', shortName: 'GAL', country: 'Turkey', primaryColor: '#F97316', secondaryColor: '#DC2626', reputation: 84, stadiumName: 'Rams Park', stadiumCapacity: 53500, formation: '4-2-3-1' },
      { id: 'tur_superlig_2', name: 'Fenerbahce', shortName: 'FEN', country: 'Turkey', primaryColor: '#1D4ED8', secondaryColor: '#FACC15', reputation: 84, stadiumName: 'Sukru Saracoglu Stadium', stadiumCapacity: 47834, formation: '4-4-2' },
      { id: 'tur_superlig_3', name: 'Besiktas', shortName: 'BES', country: 'Turkey', primaryColor: '#111827', secondaryColor: '#FFFFFF', reputation: 82, stadiumName: 'Tupras Stadium', stadiumCapacity: 42590, formation: '3-5-2' },
      { id: 'tur_superlig_4', name: 'Trabzonspor', shortName: 'TRA', country: 'Turkey', primaryColor: '#7C2D12', secondaryColor: '#1D4ED8', reputation: 79, stadiumName: 'Papara Park', stadiumCapacity: 40461, formation: '4-3-3' },
      { id: 'tur_superlig_5', name: 'Istanbul Basaksehir', shortName: 'IBFK', country: 'Turkey', primaryColor: '#F97316', secondaryColor: '#111827', reputation: 76, stadiumName: 'Basaksehir Fatih Terim Stadium', stadiumCapacity: 17156, formation: '4-2-3-1' },
      { id: 'tur_superlig_6', name: 'Adana Demirspor', shortName: 'ADS', country: 'Turkey', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 73, stadiumName: 'Yeni Adana Stadium', stadiumCapacity: 33000, formation: '4-4-2' },
      { id: 'tur_superlig_7', name: 'Sivasspor', shortName: 'SIV', country: 'Turkey', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 72, stadiumName: 'BG Group 4 Eylul Stadium', stadiumCapacity: 27532, formation: '3-5-2' },
      { id: 'tur_superlig_8', name: 'Kasimpasa', shortName: 'KAS', country: 'Turkey', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 70, stadiumName: 'Recep Tayyip Erdogan Stadium', stadiumCapacity: 14234, formation: '4-3-3' }
    ],
  },
  {
    id: 'gha_prem', name: 'Ghana Premier League', country: 'Ghana', region: 'AFRICA', tier: 1,
    clubs: [
      { id: 'gha_prem_1', name: 'Asante Kotoko', shortName: 'KOT', country: 'Ghana', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 77, stadiumName: 'Baba Yara Stadium', stadiumCapacity: 40000, formation: '4-4-2' },
      { id: 'gha_prem_2', name: 'Hearts of Oak', shortName: 'HEA', country: 'Ghana', primaryColor: '#7C2D12', secondaryColor: '#FACC15', reputation: 76, stadiumName: 'Accra Sports Stadium', stadiumCapacity: 40000, formation: '3-5-2' },
      { id: 'gha_prem_3', name: 'Medeama SC', shortName: 'MED', country: 'Ghana', primaryColor: '#FACC15', secondaryColor: '#111827', reputation: 73, stadiumName: 'TNA Park', stadiumCapacity: 10000, formation: '4-3-3' },
      { id: 'gha_prem_4', name: 'Aduana Stars', shortName: 'ADU', country: 'Ghana', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 72, stadiumName: 'A Dormaa Park', stadiumCapacity: 10000, formation: '4-2-3-1' },
      { id: 'gha_prem_5', name: 'Dreams FC', shortName: 'DRM', country: 'Ghana', primaryColor: '#16A34A', secondaryColor: '#FFFFFF', reputation: 71, stadiumName: 'Dawu Park', stadiumCapacity: 5000, formation: '4-4-2' },
      { id: 'gha_prem_6', name: 'Bechem United', shortName: 'BEC', country: 'Ghana', primaryColor: '#F97316', secondaryColor: '#111827', reputation: 70, stadiumName: 'Bechem Park', stadiumCapacity: 5000, formation: '3-5-2' },
      { id: 'gha_prem_7', name: 'Legon Cities', shortName: 'LEG', country: 'Ghana', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 69, stadiumName: 'El Wak Stadium', stadiumCapacity: 4000, formation: '4-3-3' },
      { id: 'gha_prem_8', name: 'Karela United', shortName: 'KAR', country: 'Ghana', primaryColor: '#16A34A', secondaryColor: '#FACC15', reputation: 68, stadiumName: 'Aliu Mahama Stadium', stadiumCapacity: 10000, formation: '4-2-3-1' }
    ],
  },
  {
    id: 'ken_prem', name: 'Kenyan Premier League', country: 'Kenya', region: 'AFRICA', tier: 1,
    clubs: [
      { id: 'ken_prem_1', name: 'Gor Mahia', shortName: 'GOR', country: 'Kenya', primaryColor: '#16A34A', secondaryColor: '#FFFFFF', reputation: 76, stadiumName: 'Moi International Sports Centre', stadiumCapacity: 60000, formation: '3-5-2' },
      { id: 'ken_prem_2', name: 'AFC Leopards', shortName: 'AFC', country: 'Kenya', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 75, stadiumName: 'Nyayo National Stadium', stadiumCapacity: 30000, formation: '4-3-3' },
      { id: 'ken_prem_3', name: 'Tusker FC', shortName: 'TUS', country: 'Kenya', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 73, stadiumName: 'Ruaraka Stadium', stadiumCapacity: 5000, formation: '4-2-3-1' },
      { id: 'ken_prem_4', name: 'Nairobi United', shortName: 'NAU', country: 'Kenya', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 68, stadiumName: 'Kasarani Annex', stadiumCapacity: 5000, formation: '4-4-2' },
      { id: 'ken_prem_5', name: 'Kakamega Homeboyz', shortName: 'KAK', country: 'Kenya', primaryColor: '#16A34A', secondaryColor: '#FACC15', reputation: 70, stadiumName: 'Bukhungu Stadium', stadiumCapacity: 30000, formation: '3-5-2' },
      { id: 'ken_prem_6', name: 'Bandari FC', shortName: 'BAN', country: 'Kenya', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 70, stadiumName: 'Mbaraki Sports Club', stadiumCapacity: 5000, formation: '4-3-3' },
      { id: 'ken_prem_7', name: 'Ulinzi Stars', shortName: 'ULI', country: 'Kenya', primaryColor: '#16A34A', secondaryColor: '#FFFFFF', reputation: 69, stadiumName: 'Ulinzi Sports Complex', stadiumCapacity: 3000, formation: '4-2-3-1' },
      { id: 'ken_prem_8', name: 'Shabana FC', shortName: 'SHA', country: 'Kenya', primaryColor: '#111827', secondaryColor: '#FFFFFF', reputation: 68, stadiumName: 'Gusii Stadium', stadiumCapacity: 5000, formation: '4-4-2' }
    ],
  },
  {
    id: 'zim_prem', name: 'Zimbabwe Premier Soccer League', country: 'Zimbabwe', region: 'AFRICA', tier: 1,
    clubs: [
      { id: 'zim_prem_1', name: 'Dynamos FC', shortName: 'DYN', country: 'Zimbabwe', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 76, stadiumName: 'National Sports Stadium', stadiumCapacity: 60000, formation: '4-3-3' },
      { id: 'zim_prem_2', name: 'Highlanders FC', shortName: 'HIG', country: 'Zimbabwe', primaryColor: '#111827', secondaryColor: '#FACC15', reputation: 75, stadiumName: 'Barbourfields Stadium', stadiumCapacity: 40000, formation: '4-2-3-1' },
      { id: 'zim_prem_3', name: 'FC Platinum', shortName: 'FCP', country: 'Zimbabwe', primaryColor: '#F8FAFC', secondaryColor: '#111827', reputation: 74, stadiumName: 'Mandava Stadium', stadiumCapacity: 15000, formation: '4-4-2' },
      { id: 'zim_prem_4', name: 'Ngezi Platinum Stars', shortName: 'NGE', country: 'Zimbabwe', primaryColor: '#111827', secondaryColor: '#F8FAFC', reputation: 73, stadiumName: 'Baobab Stadium', stadiumCapacity: 10000, formation: '3-5-2' },
      { id: 'zim_prem_5', name: 'Caps United', shortName: 'CAP', country: 'Zimbabwe', primaryColor: '#16A34A', secondaryColor: '#FFFFFF', reputation: 72, stadiumName: 'National Sports Stadium', stadiumCapacity: 60000, formation: '4-3-3' },
      { id: 'zim_prem_6', name: 'Manica Diamonds', shortName: 'MAN', country: 'Zimbabwe', primaryColor: '#F97316', secondaryColor: '#111827', reputation: 70, stadiumName: 'Gibbo Stadium', stadiumCapacity: 5000, formation: '4-2-3-1' },
      { id: 'zim_prem_7', name: 'Chicken Inn FC', shortName: 'CHI', country: 'Zimbabwe', primaryColor: '#DC2626', secondaryColor: '#FACC15', reputation: 70, stadiumName: 'Luveve Stadium', stadiumCapacity: 5000, formation: '4-4-2' },
      { id: 'zim_prem_8', name: 'Simba Bhora', shortName: 'SIM', country: 'Zimbabwe', primaryColor: '#FACC15', secondaryColor: '#111827', reputation: 68, stadiumName: 'Wadzanai Stadium', stadiumCapacity: 5000, formation: '3-5-2' }
    ],
  },
  {
    id: 'alg_ligue', name: 'Algerian Ligue 1', country: 'Algeria', region: 'AFRICA', tier: 1,
    clubs: [
      { id: 'alg_ligue_1', name: 'MC Alger', shortName: 'MCA', country: 'Algeria', primaryColor: '#16A34A', secondaryColor: '#DC2626', reputation: 78, stadiumName: 'Stade du 5 Juillet', stadiumCapacity: 64000, formation: '4-2-3-1' },
      { id: 'alg_ligue_2', name: 'USM Alger', shortName: 'USMA', country: 'Algeria', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 77, stadiumName: 'Stade Omar Hamadi', stadiumCapacity: 17000, formation: '4-4-2' },
      { id: 'alg_ligue_3', name: 'JS Kabylie', shortName: 'JSK', country: 'Algeria', primaryColor: '#FACC15', secondaryColor: '#16A34A', reputation: 76, stadiumName: 'Stade du 1er Novembre', stadiumCapacity: 25000, formation: '3-5-2' },
      { id: 'alg_ligue_4', name: 'CR Belouizdad', shortName: 'CRB', country: 'Algeria', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 76, stadiumName: 'Stade du 20 Aout', stadiumCapacity: 20000, formation: '4-3-3' },
      { id: 'alg_ligue_5', name: 'ES Setif', shortName: 'ESS', country: 'Algeria', primaryColor: '#111827', secondaryColor: '#FFFFFF', reputation: 75, stadiumName: 'Stade du 8 Mai 1945', stadiumCapacity: 25000, formation: '4-2-3-1' },
      { id: 'alg_ligue_6', name: 'CS Constantine', shortName: 'CSC', country: 'Algeria', primaryColor: '#16A34A', secondaryColor: '#111827', reputation: 74, stadiumName: 'Stade Mohamed Hamlaoui', stadiumCapacity: 22000, formation: '4-4-2' },
      { id: 'alg_ligue_7', name: 'USM Khenchela', shortName: 'USMK', country: 'Algeria', primaryColor: '#FACC15', secondaryColor: '#111827', reputation: 69, stadiumName: 'Stade Hamam Ammar', stadiumCapacity: 8000, formation: '3-5-2' },
      { id: 'alg_ligue_8', name: 'Paradou AC', shortName: 'PAC', country: 'Algeria', primaryColor: '#FACC15', secondaryColor: '#1D4ED8', reputation: 70, stadiumName: 'Stade Omar Benrabah', stadiumCapacity: 10000, formation: '4-3-3' }
    ],
  },
  {
    id: 'cm_ligue', name: 'Cameroon Elite One', country: 'Cameroon', region: 'AFRICA', tier: 1,
    clubs: [
      { id: 'cm_ligue_1', name: 'Cotonsport Garoua', shortName: 'COT', country: 'Cameroon', primaryColor: '#F8FAFC', secondaryColor: '#1D4ED8', reputation: 77, stadiumName: 'Stade Roumde Adjia', stadiumCapacity: 30000, formation: '4-4-2' },
      { id: 'cm_ligue_2', name: 'Canon Yaounde', shortName: 'CAN', country: 'Cameroon', primaryColor: '#DC2626', secondaryColor: '#16A34A', reputation: 74, stadiumName: 'Stade Ahmadou Ahidjo', stadiumCapacity: 40000, formation: '3-5-2' },
      { id: 'cm_ligue_3', name: 'Dynamo Douala', shortName: 'DYN', country: 'Cameroon', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 70, stadiumName: 'Stade de la Reunification', stadiumCapacity: 30000, formation: '4-3-3' },
      { id: 'cm_ligue_4', name: 'PWD Bamenda', shortName: 'PWD', country: 'Cameroon', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 70, stadiumName: 'Bamenda Municipal Stadium', stadiumCapacity: 5000, formation: '4-2-3-1' },
      { id: 'cm_ligue_5', name: 'Gazelle FA', shortName: 'GAZ', country: 'Cameroon', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 69, stadiumName: 'Stade Roumde Adjia', stadiumCapacity: 30000, formation: '4-4-2' },
      { id: 'cm_ligue_6', name: 'Union Douala', shortName: 'UDO', country: 'Cameroon', primaryColor: '#16A34A', secondaryColor: '#FFFFFF', reputation: 69, stadiumName: 'Stade de la Reunification', stadiumCapacity: 30000, formation: '3-5-2' },
      { id: 'cm_ligue_7', name: 'Aigle Royal Menoua', shortName: 'AIG', country: 'Cameroon', primaryColor: '#FACC15', secondaryColor: '#111827', reputation: 68, stadiumName: 'Stade Municipal de Dschang', stadiumCapacity: 5000, formation: '4-3-3' },
      { id: 'cm_ligue_8', name: 'Victoria United', shortName: 'VIC', country: 'Cameroon', primaryColor: '#1D4ED8', secondaryColor: '#F8FAFC', reputation: 68, stadiumName: 'Limbe Omnisport Stadium', stadiumCapacity: 20000, formation: '4-2-3-1' }
    ],
  },
  {
    id: 'usa_mls', name: 'Major League Soccer', country: 'United States', region: 'NORTH_AMERICA', tier: 1,
    clubs: [
      { id: 'usa_mls_1', name: 'Inter Miami', shortName: 'MIA', country: 'United States', primaryColor: '#F9A8D4', secondaryColor: '#111827', reputation: 83, stadiumName: 'Chase Stadium', stadiumCapacity: 21550, formation: '3-5-2' },
      { id: 'usa_mls_2', name: 'LAFC', shortName: 'LAFC', country: 'United States', primaryColor: '#111827', secondaryColor: '#FACC15', reputation: 82, stadiumName: 'BMO Stadium', stadiumCapacity: 22000, formation: '4-3-3' },
      { id: 'usa_mls_3', name: 'LA Galaxy', shortName: 'LAG', country: 'United States', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 81, stadiumName: 'Dignity Health Sports Park', stadiumCapacity: 27000, formation: '4-2-3-1' },
      { id: 'usa_mls_4', name: 'Seattle Sounders', shortName: 'SEA', country: 'United States', primaryColor: '#16A34A', secondaryColor: '#1D4ED8', reputation: 79, stadiumName: 'Lumen Field', stadiumCapacity: 68740, formation: '4-4-2' },
      { id: 'usa_mls_5', name: 'Atlanta United', shortName: 'ATL', country: 'United States', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 78, stadiumName: 'Mercedes-Benz Stadium', stadiumCapacity: 71000, formation: '3-5-2' },
      { id: 'usa_mls_6', name: 'New York City FC', shortName: 'NYC', country: 'United States', primaryColor: '#38BDF8', secondaryColor: '#1D4ED8', reputation: 77, stadiumName: 'Yankee Stadium', stadiumCapacity: 47309, formation: '4-3-3' },
      { id: 'usa_mls_7', name: 'Columbus Crew', shortName: 'CLB', country: 'United States', primaryColor: '#FACC15', secondaryColor: '#111827', reputation: 79, stadiumName: 'Lower.com Field', stadiumCapacity: 20011, formation: '4-2-3-1' },
      { id: 'usa_mls_8', name: 'Portland Timbers', shortName: 'POR', country: 'United States', primaryColor: '#16A34A', secondaryColor: '#F8FAFC', reputation: 77, stadiumName: 'Providence Park', stadiumCapacity: 25518, formation: '4-4-2' }
    ],
  },
  {
    id: 'mex_liga', name: 'Liga MX', country: 'Mexico', region: 'NORTH_AMERICA', tier: 1,
    clubs: [
      { id: 'mex_liga_1', name: 'Club America', shortName: 'AME', country: 'Mexico', primaryColor: '#FACC15', secondaryColor: '#1D4ED8', reputation: 84, stadiumName: 'Estadio Azteca', stadiumCapacity: 87523, formation: '4-3-3' },
      { id: 'mex_liga_2', name: 'Chivas Guadalajara', shortName: 'CHI', country: 'Mexico', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 82, stadiumName: 'Estadio Akron', stadiumCapacity: 46232, formation: '4-2-3-1' },
      { id: 'mex_liga_3', name: 'Tigres UANL', shortName: 'TIG', country: 'Mexico', primaryColor: '#FACC15', secondaryColor: '#1D4ED8', reputation: 83, stadiumName: 'Estadio Universitario', stadiumCapacity: 42000, formation: '4-4-2' },
      { id: 'mex_liga_4', name: 'Monterrey', shortName: 'MTY', country: 'Mexico', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 83, stadiumName: 'Estadio BBVA', stadiumCapacity: 53500, formation: '3-5-2' },
      { id: 'mex_liga_5', name: 'Cruz Azul', shortName: 'CRU', country: 'Mexico', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 80, stadiumName: 'Estadio Ciudad de los Deportes', stadiumCapacity: 33000, formation: '4-3-3' },
      { id: 'mex_liga_6', name: 'Pumas UNAM', shortName: 'PUM', country: 'Mexico', primaryColor: '#1D4ED8', secondaryColor: '#FACC15', reputation: 78, stadiumName: 'Estadio Olimpico Universitario', stadiumCapacity: 72000, formation: '4-2-3-1' },
      { id: 'mex_liga_7', name: 'Toluca', shortName: 'TOL', country: 'Mexico', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 78, stadiumName: 'Estadio Nemesio Diez', stadiumCapacity: 30000, formation: '4-4-2' },
      { id: 'mex_liga_8', name: 'Pachuca', shortName: 'PAC', country: 'Mexico', primaryColor: '#1D4ED8', secondaryColor: '#F8FAFC', reputation: 77, stadiumName: 'Estadio Hidalgo', stadiumCapacity: 30000, formation: '3-5-2' }
    ],
  },
  {
    id: 'aus_league', name: 'A-League Men', country: 'Australia', region: 'ASIA', tier: 1,
    clubs: [
      { id: 'aus_league_1', name: 'Melbourne Victory', shortName: 'MVC', country: 'Australia', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', reputation: 77, stadiumName: 'AAMI Park', stadiumCapacity: 30050, formation: '4-2-3-1' },
      { id: 'aus_league_2', name: 'Sydney FC', shortName: 'SYD', country: 'Australia', primaryColor: '#38BDF8', secondaryColor: '#FFFFFF', reputation: 77, stadiumName: 'Allianz Stadium', stadiumCapacity: 45500, formation: '4-4-2' },
      { id: 'aus_league_3', name: 'Melbourne City', shortName: 'MCI', country: 'Australia', primaryColor: '#F8FAFC', secondaryColor: '#1D4ED8', reputation: 76, stadiumName: 'AAMI Park', stadiumCapacity: 30050, formation: '3-5-2' },
      { id: 'aus_league_4', name: 'Western Sydney Wanderers', shortName: 'WSW', country: 'Australia', primaryColor: '#DC2626', secondaryColor: '#111827', reputation: 75, stadiumName: 'CommBank Stadium', stadiumCapacity: 30000, formation: '4-3-3' },
      { id: 'aus_league_5', name: 'Adelaide United', shortName: 'ADL', country: 'Australia', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', reputation: 74, stadiumName: 'Coopers Stadium', stadiumCapacity: 16500, formation: '4-2-3-1' },
      { id: 'aus_league_6', name: 'Brisbane Roar', shortName: 'BRI', country: 'Australia', primaryColor: '#F97316', secondaryColor: '#111827', reputation: 73, stadiumName: 'Suncorp Stadium', stadiumCapacity: 52000, formation: '4-4-2' },
      { id: 'aus_league_7', name: 'Perth Glory', shortName: 'PER', country: 'Australia', primaryColor: '#7C3AED', secondaryColor: '#FFFFFF', reputation: 72, stadiumName: 'HBF Park', stadiumCapacity: 20500, formation: '3-5-2' },
      { id: 'aus_league_8', name: 'Wellington Phoenix', shortName: 'WEL', country: 'Australia', primaryColor: '#111827', secondaryColor: '#F97316', reputation: 73, stadiumName: 'Sky Stadium', stadiumCapacity: 34500, formation: '4-3-3' }
    ],
  }
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
  { id: 'nat_ger', name: 'Germany', code: 'GER', region: 'EUROPE', primaryColor: '#F8FAFC', secondaryColor: '#DC2626', worldRank: 6, reputation: 88, formation: '4-3-3' },
  { id: 'nat_por', name: 'Portugal', code: 'POR', region: 'EUROPE', primaryColor: '#16A34A', secondaryColor: '#DC2626', worldRank: 7, reputation: 87, formation: '4-3-3' },
  { id: 'nat_ned', name: 'Netherlands', code: 'NED', region: 'EUROPE', primaryColor: '#F97316', secondaryColor: '#FFFFFF', worldRank: 8, reputation: 86, formation: '4-3-3' },
  { id: 'nat_sco', name: 'Scotland', code: 'SCO', region: 'EUROPE', primaryColor: '#1D4ED8', secondaryColor: '#FFFFFF', worldRank: 45, reputation: 73, formation: '4-3-3' },
  { id: 'nat_tur', name: 'Turkey', code: 'TUR', region: 'EUROPE', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', worldRank: 26, reputation: 80, formation: '4-3-3' },
  { id: 'nat_gha', name: 'Ghana', code: 'GHA', region: 'AFRICA', primaryColor: '#FACC15', secondaryColor: '#16A34A', worldRank: 52, reputation: 75, formation: '4-3-3' },
  { id: 'nat_ken', name: 'Kenya', code: 'KEN', region: 'AFRICA', primaryColor: '#DC2626', secondaryColor: '#16A34A', worldRank: 105, reputation: 66, formation: '4-3-3' },
  { id: 'nat_zim', name: 'Zimbabwe', code: 'ZIM', region: 'AFRICA', primaryColor: '#16A34A', secondaryColor: '#FACC15', worldRank: 120, reputation: 64, formation: '4-3-3' },
  { id: 'nat_alg', name: 'Algeria', code: 'ALG', region: 'AFRICA', primaryColor: '#16A34A', secondaryColor: '#FFFFFF', worldRank: 37, reputation: 77, formation: '4-3-3' },
  { id: 'nat_cmr', name: 'Cameroon', code: 'CMR', region: 'AFRICA', primaryColor: '#16A34A', secondaryColor: '#FACC15', worldRank: 49, reputation: 76, formation: '4-3-3' },
  { id: 'nat_usa', name: 'United States', code: 'USA', region: 'NORTH_AMERICA', primaryColor: '#1D4ED8', secondaryColor: '#DC2626', worldRank: 15, reputation: 82, formation: '4-3-3' },
  { id: 'nat_mex', name: 'Mexico', code: 'MEX', region: 'NORTH_AMERICA', primaryColor: '#16A34A', secondaryColor: '#FFFFFF', worldRank: 17, reputation: 81, formation: '4-3-3' },
  { id: 'nat_aus', name: 'Australia', code: 'AUS', region: 'ASIA', primaryColor: '#FACC15', secondaryColor: '#1D4ED8', worldRank: 25, reputation: 79, formation: '4-3-3' }
];

const FIRST_NAMES_BY_REGION: Record<Region, string[]> = {
  EUROPE: ['Liam', 'Marco', 'Mateo', 'Lucas', 'Julian', 'Oliver', 'Hugo', 'Matteo', 'Daniel', 'Noah', 'Alessandro', 'Carlos', 'Adrian', 'Theo', 'Leo', 'Ethan', 'Bruno', 'Gabriel', 'Christiano', 'Lionel', 'Kylian', 'Neymaro', 'Erling', 'Mohammed', 'Luka', 'Jude', 'Vincent', 'Antoine', 'Pedri', 'Rodri'],
  AFRICA: ['Chinedu', 'Youssef', 'Kofi', 'Tariq', 'Samuel', 'Ibrahim', 'Moussa', 'Tendai', 'Patson', 'Sadio', 'Hakim', 'Victor', 'Idrissa', 'Emmanuel', 'Tarek', 'Bongani', 'Ayoub', 'Fiston', 'Kalidou', 'Achraf', 'Mohamed', 'Pierre', 'Wilfried', 'Thomas', 'Amadou'],
  SOUTH_AMERICA: ['Thiago', 'Matias', 'enzo', 'Rodrigo', 'Joaquin', 'Vinicius', 'Rafael', 'Nicolas', 'Santiago', 'Lautaro', 'Franco', 'Caua', 'Murilo', 'Facundo', 'Diego', 'Danilo'],
  ASIA: ['Kenji', 'Min-Jae', 'Haruto', 'Salem', 'Daichi', 'Heung-Su', 'Yuto', 'Firas', 'Takumi', 'Jae-Sung', 'Riku', 'Akram', 'Sora', 'Abdullah', 'Koji', 'Woo-Yeong'],
  NORTH_AMERICA: ['James', 'Landon', 'Diego', 'Carlos', 'Miguel', 'Jordan', 'Mateo', 'Tyler', 'Luis', 'Santiago', 'Noah', 'Alejandro'],
};

const LAST_NAMES_BY_REGION: Record<Region, string[]> = {
  EUROPE: ['Sterling', 'Conti', 'Navarro', 'Moreau', 'Belling', 'Rossi', 'Silva', 'Vargas', 'Walker', 'Esposito', 'Serrano', 'Dubois', 'Romano', 'Gomez', 'Taylor', 'Bellini', 'Alvarez', 'Bennett', 'Ronalda', 'Messio', 'Mbappee', 'Junioro', 'Haalund', 'Salahh', 'Modricc', 'Bellingham', 'De Bruyne', 'Griezmann', 'Yamall', 'Lewandowsky'],
  AFRICA: ['Okafor', 'Benali', 'Mensah', 'Diallo', 'Banda', 'Kouyate', 'El-Shenawy', 'Mokoena', 'Chukwu', 'Ndiaye', 'Toure', 'Kante', 'Ziyech', 'Tau', 'Mayele', 'Phiri', 'Abubakar', 'Hakimi', 'Mané', 'Salahh', 'Osimhen', 'Boniface', 'Lookman', 'Daka', 'Mwepu', 'Kudus'],
  SOUTH_AMERICA: ['Almeida', 'Fernandez', 'Souza', 'Pereira', 'Martinez', 'Gomes', 'Rojas', 'Costa', 'Cardozo', 'Molina', 'Oliveira', 'Santana', 'Vega', 'Barbosa', 'Bustos', 'Gimenez'],
  ASIA: ['Tanaka', 'Kim', 'Sato', 'Al-Dawsari', 'Watanabe', 'Park', 'Nakamura', 'Al-Brikan', 'Kobayashi', 'Lee', 'Ito', 'Afif', 'Yamamoto', 'Cho', 'Suzuki', 'Al-Faraj'],
  NORTH_AMERICA: ['Johnson', 'Smith', 'Garcia', 'Rodriguez', 'Martinez', 'Williams', 'Hernandez', 'Lopez', 'Brown', 'Davis', 'Torres', 'Wilson'],
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
