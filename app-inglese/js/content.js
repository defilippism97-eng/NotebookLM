'use strict';
/*
 * Contenuti didattici di Passo.
 *
 * Tutti i testi di questo file sono originali, scritti per questo progetto.
 * Ogni unità ha un campo `source`: se in futuro si importano testi da risorse
 * educative aperte (es. BC Reads, StoryWeaver, A Digital Workbook for Beginning
 * ESOL), compilare titolo, autore, URL e licenza: l'app li mostra nei crediti.
 */

const ORIGINAL = { title: 'Contenuto originale di Passo', author: 'Progetto Passo', url: '', license: 'Uso non commerciale' };

const UNITS = [
  {
    id: 'u1', level: 'A1', emoji: '👋',
    title: 'Ciao!', subtitle: 'Saluti e presentazioni',
    can: 'Sai salutare, presentarti e dire di dove sei',
    source: ORIGINAL,
    words: [
      { id: 'hello', en: 'hello', it: 'ciao, salve', ex: 'Hello! I am Marco.', exIt: 'Ciao! Sono Marco.', alt: ['hi'] },
      { id: 'name', en: 'name', it: 'nome', ex: 'My name is Sara.', exIt: 'Mi chiamo Sara.' },
      { id: 'nice-to-meet-you', en: 'nice to meet you', it: 'piacere (di conoscerti)', ex: 'Nice to meet you, Tom.', exIt: 'Piacere di conoscerti, Tom.' },
      { id: 'where', en: 'where', it: 'dove', ex: 'Where are you from?', exIt: 'Di dove sei?' },
      { id: 'from', en: 'from', it: 'da, di (provenienza)', ex: 'I am from Naples.', exIt: 'Sono di Napoli.' },
      { id: 'how-are-you', en: 'how are you', it: 'come stai', ex: 'Hi Anna, how are you?', exIt: 'Ciao Anna, come stai?' },
      { id: 'fine', en: 'fine', it: 'bene', ex: 'I am fine, thanks.', exIt: 'Sto bene, grazie.' },
      { id: 'thank-you', en: 'thank you', it: 'grazie', ex: 'Thank you very much!', exIt: 'Grazie mille!', alt: ['thanks'] },
      { id: 'years-old', en: 'years old', it: 'anni (di età)', ex: 'I am twenty years old.', exIt: 'Ho vent\'anni.' },
      { id: 'friend', en: 'friend', it: 'amico, amica', ex: 'This is my friend Paolo.', exIt: 'Questo è il mio amico Paolo.' },
    ],
    story: {
      id: 's1', title: 'At the language café',
      lines: [
        { en: 'Hello! My name is Giulia.', it: 'Ciao! Mi chiamo Giulia.' },
        { en: 'I am from Bologna, in Italy.', it: 'Sono di Bologna, in Italia.' },
        { en: 'I am twenty-eight years old.', it: 'Ho ventotto anni.' },
        { en: 'Today I am at a language café in London.', it: 'Oggi sono a un caffè linguistico a Londra.' },
        { en: 'A man says: "Hi! I\'m Sam. Nice to meet you."', it: 'Un uomo dice: "Ciao! Sono Sam. Piacere di conoscerti."' },
        { en: '"Nice to meet you too. Where are you from?"', it: '"Piacere mio. Di dove sei?"' },
        { en: '"I\'m from Leeds. And you?"', it: '"Sono di Leeds. E tu?"' },
        { en: '"I\'m Italian. I\'m from Bologna."', it: '"Sono italiana. Sono di Bologna."' },
        { en: 'Sam smiles: "Bologna? I love the food there!"', it: 'Sam sorride: "Bologna? Adoro il cibo di lì!"' },
        { en: 'Now Giulia has a new friend.', it: 'Ora Giulia ha un nuovo amico.' },
      ],
    },
    note: {
      title: 'Il soggetto non sparisce mai',
      intro: 'In italiano diciamo "sono italiana" senza "io". In inglese il soggetto serve sempre, anche per il tempo e le situazioni (it). E l\'età si dice con "essere", non con "avere".',
      pairs: [
        { no: 'Am Italian.', yes: 'I am Italian.' },
        { no: 'Is a nice day.', yes: 'It is a nice day.' },
        { no: 'I have 28 years.', yes: 'I am 28 years old.' },
      ],
      tip: 'Trucco: se in italiano il soggetto è sottinteso, chiediti "chi?" e mettilo in inglese.',
    },
    traps: [
      { prompt: 'Ho ventotto anni.', options: ['I have twenty-eight years.', 'I am twenty-eight years old.', 'I am twenty-eight years.'], answer: 1, hint: 'Per l\'età l\'inglese usa to be (essere) + years old.' },
      { prompt: 'È una bella giornata.', options: ['Is a nice day.', 'It is a nice day.', 'Are a nice day.'], answer: 1, hint: 'In inglese serve sempre un soggetto: per il tempo e le situazioni si usa it.' },
      { prompt: 'Di dove sei?', options: ['Where are you from?', 'Where you are from?', 'From where you are?'], answer: 0, hint: 'Nelle domande il verbo va prima del soggetto: are you…?' },
    ],
    speak: [
      { en: 'Nice to meet you.', it: 'Piacere di conoscerti.' },
      { en: 'Where are you from?', it: 'Di dove sei?' },
      { en: 'I am from Italy.', it: 'Sono italiano / italiana.' },
    ],
    write: { prompt: 'Presentati in due frasi: come ti chiami e di dove sei?', model: 'Hello! My name is Marco. I am from Turin.' },
  },

  {
    id: 'u2', level: 'A1', emoji: '👪',
    title: 'La famiglia', subtitle: 'Genitori, fratelli, parenti',
    can: 'Sai parlare della tua famiglia',
    source: ORIGINAL,
    words: [
      { id: 'family', en: 'family', it: 'famiglia', ex: 'My family is big.', exIt: 'La mia famiglia è grande.' },
      { id: 'mother', en: 'mother', it: 'madre', ex: 'My mother is a doctor.', exIt: 'Mia madre è medico.', alt: ['mum', 'mom'] },
      { id: 'father', en: 'father', it: 'padre', ex: 'His father is a cook.', exIt: 'Suo padre è un cuoco.', alt: ['dad'] },
      { id: 'parents', en: 'parents', it: 'genitori', ex: 'My parents live in Rome.', exIt: 'I miei genitori vivono a Roma.', trap: 'Falso amico: parents = genitori, non parenti.' },
      { id: 'relatives', en: 'relatives', it: 'parenti', ex: 'We visit our relatives at Christmas.', exIt: 'A Natale andiamo a trovare i parenti.' },
      { id: 'brother', en: 'brother', it: 'fratello', ex: 'I have a brother.', exIt: 'Ho un fratello.' },
      { id: 'sister', en: 'sister', it: 'sorella', ex: 'My sister is ten.', exIt: 'Mia sorella ha dieci anni.' },
      { id: 'children', en: 'children', it: 'figli, bambini', ex: 'They have two children.', exIt: 'Hanno due figli.', alt: ['kids'] },
      { id: 'married', en: 'married', it: 'sposato, sposata', ex: 'Emma is married.', exIt: 'Emma è sposata.' },
      { id: 'live', en: 'live', it: 'vivere, abitare', ex: 'I live in Milan.', exIt: 'Abito a Milano.' },
    ],
    story: {
      id: 's2', title: 'Tom\'s family',
      lines: [
        { en: 'This is Tom. He lives in Manchester.', it: 'Questo è Tom. Abita a Manchester.' },
        { en: 'His parents are Linda and David.', it: 'I suoi genitori sono Linda e David.' },
        { en: 'His mother is a teacher, and his father is a cook.', it: 'Sua madre è un\'insegnante e suo padre è un cuoco.' },
        { en: 'Tom has a sister, Emma, and a brother, Jack.', it: 'Tom ha una sorella, Emma, e un fratello, Jack.' },
        { en: 'Emma is married. She has two children.', it: 'Emma è sposata. Ha due figli.' },
        { en: 'Every Sunday the family has lunch together.', it: 'Ogni domenica la famiglia pranza insieme.' },
        { en: 'Sometimes their relatives come from Ireland.', it: 'A volte i loro parenti arrivano dall\'Irlanda.' },
        { en: 'The house is small, but the family is very happy.', it: 'La casa è piccola, ma la famiglia è molto felice.' },
      ],
    },
    note: {
      title: 'Parents ≠ parenti, e "suo" in due modi',
      intro: 'Parents vuol dire genitori; i parenti sono relatives. E il nostro "suo/sua" in inglese cambia in base a chi possiede: his se è un uomo, her se è una donna.',
      pairs: [
        { no: 'My parents are many: uncles, cousins…', yes: 'My relatives are many: uncles, cousins…' },
        { no: 'Tom loves her mother.', yes: 'Tom loves his mother.' },
        { no: 'The sister of Tom', yes: 'Tom\'s sister' },
      ],
      tip: 'Per il possesso tra persone l\'inglese preferisce \'s: Tom\'s sister, Anna\'s car.',
    },
    traps: [
      { prompt: 'I miei parenti vivono in Sicilia.', options: ['My parents live in Sicily.', 'My relatives live in Sicily.'], answer: 1, hint: 'Attenzione: parents significa genitori. Parenti si dice relatives.' },
      { prompt: 'Sua madre (di Tom) è insegnante.', options: ['Her mother is a teacher.', 'His mother is a teacher.'], answer: 1, hint: 'His si usa quando il possessore è un uomo (Tom), her quando è una donna.' },
      { prompt: 'La sorella di Tom', options: ['Tom\'s sister', 'The sister Tom', 'Tom sister'], answer: 0, hint: 'Per il possesso si aggiunge \'s dopo il nome: Tom\'s.' },
    ],
    speak: [
      { en: 'This is my mother.', it: 'Questa è mia madre.' },
      { en: 'I have a brother and a sister.', it: 'Ho un fratello e una sorella.' },
      { en: 'My parents live in Rome.', it: 'I miei genitori vivono a Roma.' },
    ],
    write: { prompt: 'Descrivi la tua famiglia in due frasi.', model: 'I have one sister. My parents live in Milan.' },
  },

  {
    id: 'u3', level: 'A1', emoji: '☕',
    title: 'Al bar', subtitle: 'Ordinare e chiedere il prezzo',
    can: 'Sai ordinare al bar e chiedere quanto costa',
    source: ORIGINAL,
    words: [
      { id: 'coffee', en: 'coffee', it: 'caffè', ex: 'A coffee, please.', exIt: 'Un caffè, per favore.' },
      { id: 'water', en: 'water', it: 'acqua', ex: 'Can I have some water?', exIt: 'Posso avere dell\'acqua?' },
      { id: 'tea', en: 'tea', it: 'tè', ex: 'I drink tea in the morning.', exIt: 'Bevo il tè la mattina.' },
      { id: 'breakfast', en: 'breakfast', it: 'colazione', ex: 'Breakfast is ready!', exIt: 'La colazione è pronta!' },
      { id: 'id-like', en: 'I\'d like', it: 'vorrei', ex: 'I\'d like a tea, please.', exIt: 'Vorrei un tè, per favore.', alt: ['i would like'] },
      { id: 'please', en: 'please', it: 'per favore', ex: 'Water, please.', exIt: 'Acqua, per favore.' },
      { id: 'how-much', en: 'how much', it: 'quanto (costa)', ex: 'How much is it?', exIt: 'Quanto costa?' },
      { id: 'hungry', en: 'hungry', it: 'affamato (avere fame)', ex: 'I am hungry.', exIt: 'Ho fame.' },
      { id: 'thirsty', en: 'thirsty', it: 'assetato (avere sete)', ex: 'Are you thirsty?', exIt: 'Hai sete?' },
      { id: 'bill', en: 'bill', it: 'conto', ex: 'The bill, please.', exIt: 'Il conto, per favore.', alt: ['check'] },
    ],
    story: {
      id: 's3', title: 'Breakfast in Dublin',
      lines: [
        { en: 'It is eight o\'clock in the morning.', it: 'Sono le otto del mattino.' },
        { en: 'Marco is hungry, so he goes to a small café.', it: 'Marco ha fame, quindi va in un piccolo bar.' },
        { en: '"Good morning! What would you like?" asks the waiter.', it: '"Buongiorno! Cosa desidera?" chiede il cameriere.' },
        { en: '"I\'d like a coffee and a croissant, please."', it: '"Vorrei un caffè e un cornetto, per favore."' },
        { en: '"Anything else?"', it: '"Altro?"' },
        { en: '"Yes, a glass of water. I\'m thirsty."', it: '"Sì, un bicchiere d\'acqua. Ho sete."' },
        { en: 'The coffee is big and hot. It is not like in Italy!', it: 'Il caffè è grande e caldo. Non è come in Italia!' },
        { en: '"How much is it?"', it: '"Quanto costa?"' },
        { en: '"Six euros, please."', it: '"Sei euro, per favore."' },
        { en: 'Marco pays the bill and says: "Thank you, have a nice day!"', it: 'Marco paga il conto e dice: "Grazie, buona giornata!"' },
      ],
    },
    note: {
      title: 'Fame e sete non si "hanno"',
      intro: 'In italiano abbiamo fame, sete, freddo. In inglese invece si è: to be + aggettivo. Per ordinare con gentilezza si usa I\'d like (vorrei), più cortese di I want.',
      pairs: [
        { no: 'I have hunger.', yes: 'I am hungry.' },
        { no: 'I have thirst.', yes: 'I am thirsty.' },
        { no: 'I have cold.', yes: 'I am cold.' },
      ],
      tip: 'Al bar: I\'d like… / Can I have…? sono sempre una scelta sicura.',
    },
    traps: [
      { prompt: 'Ho fame.', options: ['I have hunger.', 'I am hungry.', 'I have hungry.'], answer: 1, hint: 'Fame, sete, freddo, caldo: in inglese si usa to be + aggettivo.' },
      { prompt: 'Vorrei un tè, per favore.', options: ['I want a tea, please.', 'I\'d like a tea, please.', 'I would a tea, please.'], answer: 1, hint: 'Per ordinare in modo gentile si usa I\'d like (I would like).' },
      { prompt: 'Quanto costa?', options: ['How much is it?', 'How many is it?', 'How much it is?'], answer: 0, hint: 'Per i prezzi si usa how much; nelle domande il verbo va prima: is it.' },
    ],
    speak: [
      { en: 'I\'d like a coffee, please.', it: 'Vorrei un caffè, per favore.' },
      { en: 'How much is it?', it: 'Quanto costa?' },
      { en: 'I am thirsty.', it: 'Ho sete.' },
    ],
    write: { prompt: 'Ordina la tua colazione preferita.', model: 'I\'d like a tea and a croissant, please.' },
  },

  {
    id: 'u4', level: 'A1', emoji: '⏰',
    title: 'La mia giornata', subtitle: 'Abitudini e orari',
    can: 'Sai raccontare la tua giornata tipo',
    source: ORIGINAL,
    words: [
      { id: 'wake-up', en: 'wake up', it: 'svegliarsi', ex: 'I wake up at seven.', exIt: 'Mi sveglio alle sette.' },
      { id: 'work', en: 'work', it: 'lavorare, lavoro', ex: 'I work in a shop.', exIt: 'Lavoro in un negozio.' },
      { id: 'every-day', en: 'every day', it: 'ogni giorno', ex: 'I read every day.', exIt: 'Leggo ogni giorno.' },
      { id: 'usually', en: 'usually', it: 'di solito', ex: 'I usually walk to school.', exIt: 'Di solito vado a scuola a piedi.' },
      { id: 'always', en: 'always', it: 'sempre', ex: 'She always smiles.', exIt: 'Lei sorride sempre.' },
      { id: 'never', en: 'never', it: 'mai', ex: 'I never eat meat.', exIt: 'Non mangio mai carne.' },
      { id: 'morning', en: 'morning', it: 'mattina', ex: 'Good morning!', exIt: 'Buongiorno!' },
      { id: 'evening', en: 'evening', it: 'sera', ex: 'I study in the evening.', exIt: 'Studio la sera.' },
      { id: 'lunch', en: 'lunch', it: 'pranzo', ex: 'Lunch is at one.', exIt: 'Il pranzo è all\'una.' },
      { id: 'go-home', en: 'go home', it: 'tornare a casa', ex: 'I go home at six.', exIt: 'Torno a casa alle sei.' },
    ],
    story: {
      id: 's4', title: 'A normal day',
      lines: [
        { en: 'Anna is a nurse in Edinburgh.', it: 'Anna è un\'infermiera a Edimburgo.' },
        { en: 'She usually wakes up at six.', it: 'Di solito si sveglia alle sei.' },
        { en: 'She drinks a tea and reads the news.', it: 'Beve un tè e legge le notizie.' },
        { en: 'She goes to work by bike every day.', it: 'Va al lavoro in bici ogni giorno.' },
        { en: 'She has lunch at the hospital with her friends.', it: 'Pranza in ospedale con le sue amiche.' },
        { en: 'In the evening she goes home and cooks dinner.', it: 'La sera torna a casa e cucina la cena.' },
        { en: 'She never watches TV. She always reads a book.', it: 'Non guarda mai la TV. Legge sempre un libro.' },
        { en: 'But today is different: she is not working. She is at the beach!', it: 'Ma oggi è diverso: non sta lavorando. È al mare!' },
      ],
    },
    note: {
      title: 'Abitudini: present simple (con la -s)',
      intro: 'Per le cose che fai di solito si usa il present simple. Con he, she, it il verbo prende la -s. Il present continuous (am/is/are + -ing) serve solo per ciò che succede adesso.',
      pairs: [
        { no: 'She wake up at six.', yes: 'She wakes up at six.' },
        { no: 'I am working every day.', yes: 'I work every day.' },
        { no: 'I don\'t never watch TV.', yes: 'I never watch TV.' },
      ],
      tip: 'Parole come always, usually, never vanno prima del verbo: I always read.',
    },
    traps: [
      { prompt: 'Lei lavora ogni giorno.', options: ['She work every day.', 'She works every day.', 'She is work every day.'], answer: 1, hint: 'Con he, she, it il verbo al present simple prende la -s.' },
      { prompt: 'Di solito pranzo a casa.', options: ['I usually have lunch at home.', 'I am usually having lunch at home.', 'Usually I am lunch at home.'], answer: 0, hint: 'Per le abitudini si usa il present simple, non il present continuous.' },
      { prompt: 'Non guardo mai la TV.', options: ['I don\'t never watch TV.', 'I never watch TV.', 'I watch never TV.'], answer: 1, hint: 'Never è già negativo: non serve don\'t. Va prima del verbo.' },
    ],
    speak: [
      { en: 'I usually wake up at seven.', it: 'Di solito mi sveglio alle sette.' },
      { en: 'I go to work by bus.', it: 'Vado al lavoro in autobus.' },
      { en: 'I never drink coffee in the evening.', it: 'Non bevo mai caffè la sera.' },
    ],
    write: { prompt: 'Racconta la tua mattina in due frasi.', model: 'I usually wake up at seven. I have breakfast and go to work.' },
  },

  {
    id: 'u5', level: 'A1', emoji: '🏙️',
    title: 'In città', subtitle: 'Luoghi e indicazioni',
    can: 'Sai chiedere e dare semplici indicazioni',
    source: ORIGINAL,
    words: [
      { id: 'library', en: 'library', it: 'biblioteca', ex: 'I study at the library.', exIt: 'Studio in biblioteca.', trap: 'Falso amico: library = biblioteca, non libreria.' },
      { id: 'bookshop', en: 'bookshop', it: 'libreria (negozio)', ex: 'I buy books at the bookshop.', exIt: 'Compro libri in libreria.', alt: ['bookstore'] },
      { id: 'station', en: 'station', it: 'stazione', ex: 'Where is the station?', exIt: 'Dov\'è la stazione?' },
      { id: 'street', en: 'street', it: 'strada, via', ex: 'This street is long.', exIt: 'Questa strada è lunga.', alt: ['road'] },
      { id: 'left', en: 'left', it: 'sinistra', ex: 'Turn left here.', exIt: 'Gira a sinistra qui.' },
      { id: 'right', en: 'right', it: 'destra', ex: 'The bank is on the right.', exIt: 'La banca è a destra.' },
      { id: 'near', en: 'near', it: 'vicino (a)', ex: 'I live near the park.', exIt: 'Abito vicino al parco.' },
      { id: 'ticket', en: 'ticket', it: 'biglietto', ex: 'One ticket, please.', exIt: 'Un biglietto, per favore.' },
      { id: 'open', en: 'open', it: 'aperto, aprire', ex: 'The shop is open.', exIt: 'Il negozio è aperto.' },
      { id: 'wait-for', en: 'wait for', it: 'aspettare', ex: 'I wait for the bus.', exIt: 'Aspetto l\'autobus.' },
    ],
    story: {
      id: 's5', title: 'Lost in Oxford',
      lines: [
        { en: 'Luca is in Oxford for the weekend.', it: 'Luca è a Oxford per il fine settimana.' },
        { en: 'He wants to buy a book, so he asks: "Where is the library?"', it: 'Vuole comprare un libro, quindi chiede: "Dov\'è la library?"' },
        { en: 'A woman laughs: "At the library you can read books, but you can\'t buy them!"', it: 'Una donna ride: "In biblioteca puoi leggere libri, ma non comprarli!"' },
        { en: '"You need a bookshop. There is one near the station."', it: '"Ti serve una libreria. Ce n\'è una vicino alla stazione."' },
        { en: '"Go down this street and turn left. Then turn right."', it: '"Scendi per questa strada e gira a sinistra. Poi gira a destra."' },
        { en: 'Luca finds the bookshop, but it is not open yet.', it: 'Luca trova la libreria, ma non è ancora aperta.' },
        { en: 'He waits for ten minutes and listens to music.', it: 'Aspetta dieci minuti e ascolta musica.' },
        { en: 'Then he buys a book and a ticket for the bus.', it: 'Poi compra un libro e un biglietto per l\'autobus.' },
      ],
    },
    note: {
      title: 'Falsi amici e preposizioni nascoste',
      intro: 'Library sembra "libreria", ma è la biblioteca. Alcuni verbi poi vogliono una preposizione che in italiano non c\'è: listen to, wait for.',
      pairs: [
        { no: 'I buy books at the library.', yes: 'I buy books at the bookshop.' },
        { no: 'I listen music.', yes: 'I listen to music.' },
        { no: 'I wait the bus.', yes: 'I wait for the bus.' },
      ],
      tip: 'Impara questi verbi insieme alla loro preposizione, come un unico blocco: listen to, wait for, look for.',
    },
    traps: [
      { prompt: 'Compro un libro in libreria.', options: ['I buy a book at the library.', 'I buy a book at the bookshop.'], answer: 1, hint: 'Library è un falso amico: significa biblioteca. Il negozio di libri è il bookshop.' },
      { prompt: 'Ascolto musica.', options: ['I listen music.', 'I listen to music.', 'I hear to music.'], answer: 1, hint: 'Listen vuole sempre to prima di ciò che ascolti.' },
      { prompt: 'Aspetto l\'autobus.', options: ['I wait the bus.', 'I wait for the bus.', 'I attend the bus.'], answer: 1, hint: 'Wait vuole for. Attend significa partecipare, non aspettare.' },
    ],
    speak: [
      { en: 'Where is the station?', it: 'Dov\'è la stazione?' },
      { en: 'Turn left, then turn right.', it: 'Gira a sinistra, poi gira a destra.' },
      { en: 'I am waiting for the bus.', it: 'Sto aspettando l\'autobus.' },
    ],
    write: { prompt: 'Spiega come arrivare a casa tua dalla stazione.', model: 'Go down this street and turn right. My house is near the park.' },
  },

  {
    id: 'u6', level: 'A2', emoji: '🪤',
    title: 'Trappole per italiani', subtitle: 'Falsi amici frequenti',
    can: 'Riconosci i falsi amici più comuni',
    source: ORIGINAL,
    words: [
      { id: 'actually', en: 'actually', it: 'in realtà', ex: 'Actually, I am from Rome.', exIt: 'In realtà sono di Roma.', trap: 'Falso amico: actually = in realtà, non attualmente.' },
      { id: 'currently', en: 'currently', it: 'attualmente', ex: 'I currently live in Paris.', exIt: 'Attualmente vivo a Parigi.', alt: ['at the moment'] },
      { id: 'eventually', en: 'eventually', it: 'alla fine', ex: 'Eventually, we found the hotel.', exIt: 'Alla fine abbiamo trovato l\'albergo.', trap: 'Falso amico: eventually = alla fine, non eventualmente.' },
      { id: 'possibly', en: 'possibly', it: 'eventualmente, forse', ex: 'We can possibly meet on Monday.', exIt: 'Eventualmente possiamo vederci lunedì.' },
      { id: 'sensible', en: 'sensible', it: 'ragionevole, assennato', ex: 'That is a sensible idea.', exIt: 'È un\'idea ragionevole.', trap: 'Falso amico: sensible = ragionevole, non sensibile.' },
      { id: 'sensitive', en: 'sensitive', it: 'sensibile', ex: 'He is very sensitive.', exIt: 'È molto sensibile.' },
      { id: 'polite', en: 'polite', it: 'educato, gentile', ex: 'Be polite, please.', exIt: 'Sii educato, per favore.' },
      { id: 'educated', en: 'educated', it: 'istruito', ex: 'She is an educated woman.', exIt: 'È una donna istruita.', trap: 'Falso amico: educated = istruito, non educato.' },
      { id: 'argument', en: 'argument', it: 'litigio, discussione', ex: 'They had an argument.', exIt: 'Hanno litigato.', trap: 'Falso amico: argument = litigio, non argomento.' },
      { id: 'topic', en: 'topic', it: 'argomento', ex: 'The topic is easy.', exIt: 'L\'argomento è facile.', alt: ['subject'] },
    ],
    story: {
      id: 's6', title: 'A small argument',
      lines: [
        { en: 'Paolo and his English friend Kate are at the cinema.', it: 'Paolo e la sua amica inglese Kate sono al cinema.' },
        { en: 'Paolo says: "The film is about a very sensible man."', it: 'Paolo dice: "Il film parla di un uomo molto sensible."' },
        { en: 'Kate is confused: "Sensible? Actually, he cries all the time. He is sensitive!"', it: 'Kate è confusa: "Ragionevole? In realtà piange sempre. È sensibile!"' },
        { en: '"Oh, sorry. In Italian, sensibile means sensitive."', it: '"Oh, scusa. In italiano sensibile vuol dire sensitive."' },
        { en: 'Then they have a small argument about the end of the film.', it: 'Poi hanno una piccola discussione sul finale del film.' },
        { en: 'But they are polite, and they laugh a lot.', it: 'Ma sono educati, e ridono molto.' },
        { en: 'Eventually, they agree: the topic is difficult, but the film is good.', it: 'Alla fine sono d\'accordo: l\'argomento è difficile, ma il film è bello.' },
      ],
    },
    note: {
      title: 'Parole che sembrano italiane (ma non lo sono)',
      intro: 'Molte parole inglesi di origine latina somigliano all\'italiano ma hanno un altro significato. Sono errori naturali per noi: basta conoscerli.',
      pairs: [
        { no: 'Actually I live in Milan. (= attualmente)', yes: 'Currently I live in Milan.' },
        { no: 'He is very educated. (= educato)', yes: 'He is very polite.' },
        { no: 'What is the argument of the book?', yes: 'What is the topic of the book?' },
      ],
      tip: 'Altre coppie da ricordare: library/biblioteca, parents/genitori, pretend/fingere, sensible/ragionevole.',
    },
    traps: [
      { prompt: 'Attualmente vivo a Londra.', options: ['Actually I live in London.', 'Currently I live in London.'], answer: 1, hint: 'Actually significa in realtà. Attualmente si dice currently.' },
      { prompt: 'È un ragazzo molto educato.', options: ['He is a very educated boy.', 'He is a very polite boy.'], answer: 1, hint: 'Educated vuol dire istruito. Educato (gentile) si dice polite.' },
      { prompt: 'Alla fine ha trovato lavoro.', options: ['Eventually, he found a job.', 'Possibly, he found a job.'], answer: 0, hint: 'Eventually significa alla fine, non eventualmente.' },
    ],
    speak: [
      { en: 'Actually, I am from Rome.', it: 'In realtà sono di Roma.' },
      { en: 'She is very polite.', it: 'Lei è molto educata.' },
      { en: 'Eventually, we found the station.', it: 'Alla fine abbiamo trovato la stazione.' },
    ],
    write: { prompt: 'Scrivi una frase con actually e una con currently.', model: 'Actually, I don\'t like coffee. Currently, I live in Florence.' },
  },
];

/* Glossario per il tocco sulle parole nelle storie (parole non incluse nelle lezioni). */
const GLOSSARY = {
  old: 'vecchio; (età) di … anni', meet: 'incontrare, conoscere', every: 'ogni', "i'd": 'io vorrei (I would)', else: 'altro',
  how: 'come', much: 'molto; quanto', thank: 'ringraziare', wake: 'svegliarsi (wake up)', up: 'su, in piedi', home: 'casa',
  working: 'lavorando (sta lavorando)', listen: 'ascoltare', listens: 'ascolta', time: 'tempo, volta', sensibile: 'parola italiana (= sensitive)',
  a: 'un, una', about: 'su, riguardo a', agree: 'essere d\'accordo', all: 'tutto', 'all the time': 'sempre, di continuo',
  am: 'sono (io)', and: 'e', anything: 'qualcosa', 'anything else': 'altro?', are: 'sei, siamo, siete, sono', asks: 'chiede', ask: 'chiedere',
  at: 'a, in, presso', beach: 'spiaggia, mare', big: 'grande', bike: 'bicicletta', book: 'libro', books: 'libri', bus: 'autobus',
  but: 'ma', buy: 'comprare', buys: 'compra', by: 'in, con (mezzo di trasporto)', 'by bike': 'in bicicletta',
  café: 'bar, caffetteria', cafe: 'bar, caffetteria', can: 'potere (puoi, può…)', "can't": 'non puoi, non può', cinema: 'cinema',
  come: 'venire, arrivare', confused: 'confuso', cook: 'cuoco; cucinare', cooks: 'cucina', cries: 'piange', cry: 'piangere',
  croissant: 'cornetto', day: 'giorno, giornata', different: 'diverso', difficult: 'difficile', dinner: 'cena', down: 'giù',
  drinks: 'beve', drink: 'bere', eight: 'otto', end: 'fine, finale', english: 'inglese', euros: 'euro', film: 'film',
  finds: 'trova', find: 'trovare', food: 'cibo', for: 'per', glass: 'bicchiere', 'go down': 'scendere, percorrere', goes: 'va', go: 'andare',
  good: 'buono, bello', 'good morning': 'buongiorno', happy: 'felice', has: 'ha', have: 'avere; (pasti) fare, prendere',
  'have a nice day': 'buona giornata', 'have lunch': 'pranzare', he: 'lui', her: 'lei, sua (di lei)', hi: 'ciao', his: 'suo, sua (di lui)',
  hospital: 'ospedale', hot: 'caldo', house: 'casa', i: 'io', "i'm": 'io sono', in: 'in, a', is: 'è', it: 'esso, essa (cose)',
  italian: 'italiano, italiana', italy: 'Italia', language: 'lingua', 'language café': 'caffè linguistico (incontro per conversare)',
  laugh: 'ridere', laughs: 'ride', like: 'come; piacere', 'like in italy': 'come in Italia', lives: 'vive, abita', lot: 'molto', 'a lot': 'molto',
  love: 'amare, adorare', man: 'uomo', means: 'significa', mean: 'significare', minutes: 'minuti', music: 'musica', my: 'mio, mia',
  need: 'avere bisogno di', new: 'nuovo', news: 'notizie', nice: 'bello, piacevole', normal: 'normale', not: 'non', now: 'ora, adesso',
  nurse: 'infermiere, infermiera', "o'clock": 'in punto (per le ore)', of: 'di', oh: 'oh', one: 'uno, una', pays: 'paga', pay: 'pagare',
  read: 'leggere', reads: 'legge', says: 'dice', say: 'dire', she: 'lei', six: 'sei (numero)', small: 'piccolo', smiles: 'sorride',
  so: 'quindi, così', sometimes: 'a volte', sorry: 'scusa, mi dispiace', sunday: 'domenica', teacher: 'insegnante', ten: 'dieci',
  the: 'il, lo, la, i, gli, le', their: 'loro (possessivo)', them: 'li, le, loro', then: 'poi', there: 'lì, là', 'there is': 'c\'è',
  they: 'loro', this: 'questo, questa', to: 'a, per', today: 'oggi', together: 'insieme', too: 'anche', turn: 'girare, svoltare',
  tv: 'televisione', 'twenty-eight': 'ventotto', two: 'due', very: 'molto', waiter: 'cameriere', waits: 'aspetta', wants: 'vuole',
  want: 'volere', watches: 'guarda', watch: 'guardare', weekend: 'fine settimana', what: 'che cosa', 'what would you like': 'cosa desidera?',
  with: 'con', woman: 'donna', would: '(forma del condizionale)', yes: 'sì', yet: 'ancora (nelle negazioni)', you: 'tu, voi',
  "you're": 'tu sei', your: 'tuo, tua', years: 'anni', glad: 'contento', job: 'lavoro', found: 'trovò, ha trovato',
};

/* Nomi propri usati nelle storie: al tocco mostrano "nome proprio". */
const NAMES = ['giulia', 'bologna', 'london', 'sam', 'leeds', 'tom', 'manchester', 'linda', 'david', 'emma', 'jack', 'ireland',
  'marco', 'dublin', 'anna', 'edinburgh', 'luca', 'oxford', 'paolo', 'kate'];

if (typeof module !== 'undefined') module.exports = { UNITS, GLOSSARY, NAMES };
