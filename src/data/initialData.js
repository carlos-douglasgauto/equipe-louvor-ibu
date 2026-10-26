// Initial data seeded from the user's scale for November 2026
export const INITIAL_MEMBERS = [
  { id: 'm1', name: 'Letícia Welika', roles: ['Ministração', 'Vocal'], phone: '(11) 98765-4321', active: true },
  { id: 'm2', name: 'Pathy', roles: ['Vocal'], phone: '(11) 98765-4322', active: true },
  { id: 'm3', name: 'Cris', roles: ['Ministração', 'Vocal'], phone: '(11) 98765-4323', active: true },
  { id: 'm4', name: 'Elisson Júnior', roles: ['Baixo'], phone: '(11) 98765-4324', active: true },
  { id: 'm5', name: 'Cláudio', roles: ['Bateria'], phone: '(11) 98765-4325', active: true },
  { id: 'm6', name: 'Samuel Costa', roles: ['Guitarra'], phone: '(11) 98765-4326', active: true },
  { id: 'm7', name: 'Leandro Araújo', roles: ['Teclado'], phone: '(11) 98765-4327', active: true },
  { id: 'm8', name: 'Isaac', roles: ['Violão', 'Guitarra'], phone: '(11) 98765-4328', active: true },
  { id: 'm9', name: 'Ingrid', roles: ['Ministração', 'Vocal'], phone: '(11) 98765-4329', active: true },
  { id: 'm10', name: 'Rebeca', roles: ['Vocal'], phone: '(11) 98765-4330', active: true },
  { id: 'm11', name: 'Lucas Bispo', roles: ['Teclado', 'Baixo'], phone: '(11) 98765-4331', active: true },
  { id: 'm12', name: 'Douglas', roles: ['Violão'], phone: '(11) 98765-4332', active: true },
  { id: 'm13', name: 'Ana Mirian', roles: ['Ministração', 'Vocal'], phone: '(11) 98765-4333', active: true },
  { id: 'm14', name: 'Yasmim', roles: ['Vocal'], phone: '(11) 98765-4334', active: true },
  { id: 'm15', name: 'Samuel Bellan', roles: ['Teclado'], phone: '(11) 98765-4335', active: true },
  { id: 'm16', name: 'Beni', roles: ['Violão'], phone: '(11) 98765-4336', active: true },
  { id: 'm17', name: 'Larissa', roles: ['Vocal'], phone: '(11) 98765-4337', active: true },
  { id: 'm18', name: 'Thaissa', roles: ['Vocal'], phone: '(11) 98765-4338', active: true },
  { id: 'm19', name: 'Joel Silva', roles: ['Baixo'], phone: '(11) 98765-4339', active: true },
  { id: 'm20', name: 'Davi Novaes', roles: ['Bateria'], phone: '(11) 98765-4340', active: true },
  { id: 'm21', name: 'Samuel', roles: ['Ministração', 'Vocal'], phone: '(11) 98765-4341', active: true }
];

export const INITIAL_SCHEDULES = [
  {
    id: 'scale-2026-11-01',
    date: '2026-11-01',
    title: 'Domingo - Culto de Celebração',
    rehearsal: {
      date: '2026-10-31',
      time: '16:00',
      location: 'Templo Principal',
      notes: 'Passagem de som e alinhamento das dinâmicas'
    },
    lineup: {
      ministration: 'Letícia Welika',
      vocals: ['Pathy', 'Cris'],
      bass: 'Elisson Júnior',
      drums: 'Cláudio',
      guitar1: 'Samuel Costa',
      guitar2: '',
      keyboard: 'Leandro Araújo',
      acousticGuitar: 'Isaac'
    },
    confirmedMembers: ['Letícia Welika', 'Elisson Júnior', 'Samuel Costa'],
    songs: [
      {
        id: 's1-1',
        title: 'Bondade de Deus',
        artist: 'Isaías Saad',
        version: 'Versão Ao Vivo (Acústico/Full)',
        key: 'G',
        originalKey: 'G',
        bpm: 70,
        youtubeUrl: 'https://www.youtube.com/watch?v=0h5o4q7y91I',
        cifraUrl: 'https://www.cifraclub.com.br/isaias-saad/bondade-de-deus/',
        notes: 'Começa no violão e piano suave. No refrão 2 entra a bateria cheia.',
        chordsText: `Tom: G
[Intro] G  C9  G  C9

[Primeira Parte]
G
 Te amo, Deus
      C9          G
Tua graça nunca falha
D/F#  Em           C9         D
Todos os dias eu estou em Tuas mãos
             Em
Desde quando me levanto
C9           G  D/F#  Em
 Até eu me deitar
   C9         D         G
Eu cantarei da bondade de Deus

[Refrão]
C9                      G
És fiel em todo tempo
C9                       G           D
Em todo tempo Tu és tão, tão bom
C9                      Em
Com todo fôlego que tenho
   C9         D         G
Eu cantarei da bondade de Deus`
      },
      {
        id: 's1-2',
        title: 'É Tudo Sobre Você',
        artist: 'Morada',
        version: 'Morada Oficial',
        key: 'E',
        originalKey: 'E',
        bpm: 125,
        youtubeUrl: 'https://www.youtube.com/watch?v=kYJzEw1lQ5o',
        cifraUrl: 'https://www.cifraclub.com.br/morada/e-tudo-sobre-voce/',
        notes: 'Celebração com guitarra marcante no riff de abertura.',
        chordsText: `Tom: E
[Intro] C#m  A  E  B

[Verso]
C#m             A
 Todas as coisas cooperam pro bem
E                  B
 Daqueles que amam a Deus
C#m               A
 Não são sobre nós, não é sobre nós
E                B
 É tudo sobre Você!

[Refrão]
          C#m        A
Jesus, Jesus! É Teu nome!
          E          B
Jesus, Jesus! É Teu nome!`
      },
      {
        id: 's1-3',
        title: 'Me Atraiu',
        artist: 'Gabriela Rocha',
        version: 'Gabriela Rocha (A Presença)',
        key: 'A',
        originalKey: 'A',
        bpm: 68,
        youtubeUrl: 'https://www.youtube.com/watch?v=VlqNfgU-8r4',
        cifraUrl: 'https://www.cifraclub.com.br/gabriela-rocha/me-atraiu/',
        notes: 'Momento de ministração e adoração profética. Segurar a dinâmica.',
        chordsText: `Tom: A
[Intro] A  D9  F#m7  E

[Verso]
A                  D9
 O Teu amor me atraiu
F#m7               E
 Tua presença me cativou
A                       D9
 Não há outro lugar onde eu queira estar
F#m7              E
 Aos Teus pés, Senhor`
      }
    ]
  },
  {
    id: 'scale-2026-11-08',
    date: '2026-11-08',
    title: 'Domingo - Culto da Família',
    rehearsal: {
      date: '2026-11-07',
      time: '17:00',
      location: 'Templo Principal',
      notes: 'Alinhamento dos vocais'
    },
    lineup: {
      ministration: 'Ingrid',
      vocals: ['Rebeca', 'Pathy'],
      bass: 'Elisson Júnior',
      drums: 'Cláudio',
      guitar1: 'Samuel Costa',
      guitar2: 'Isaac',
      keyboard: 'Lucas Bispo',
      acousticGuitar: 'Douglas'
    },
    confirmedMembers: ['Ingrid', 'Douglas', 'Lucas Bispo'],
    songs: [
      {
        id: 's2-1',
        title: 'Tu És Bom (You Are Good)',
        artist: 'Israel Houghton / Fred Arrais',
        version: 'Fred Arrais',
        key: 'E',
        originalKey: 'E',
        bpm: 130,
        youtubeUrl: 'https://www.youtube.com/watch?v=1r0w-3U-0Ew',
        cifraUrl: '',
        notes: 'Abertura com groove no baixo e slap.',
        chordsText: `Tom: E
[Intro] E5  G5  A5  B5

[Refrão]
E                    B/D#
 Senhor, Tu és bom e Tua misericórdia
D            A/C#
 Dura para sempre!`
      },
      {
        id: 's2-2',
        title: 'Vitorioso És',
        artist: 'Gabriel Guedes',
        version: 'Gabriel Guedes ft. Nivea Soares',
        key: 'Bb',
        originalKey: 'Bb',
        bpm: 72,
        youtubeUrl: 'https://www.youtube.com/watch?v=Zf_x279x-8w',
        cifraUrl: '',
        notes: 'Entrada progressiva até o ápice com as guitarras.',
        chordsText: `Tom: Bb
[Intro] Bb  Eb  Gm  F

[Refrão]
Eb      Bb       F       Gm
 Aleluia, nosso Deus é poderoso
Eb      Bb       F
 Vitorioso és!`
      }
    ]
  },
  {
    id: 'scale-2026-11-15',
    date: '2026-11-15',
    title: 'Domingo - Culto de Santa Ceia',
    rehearsal: {
      date: '2026-11-14',
      time: '16:30',
      location: 'Templo Principal',
      notes: 'Repertório solene de Ceia'
    },
    lineup: {
      ministration: 'Ana Mirian',
      vocals: ['Yasmim', 'Pathy'],
      bass: 'Elisson Júnior',
      drums: 'Cláudio',
      guitar1: 'Samuel Costa',
      guitar2: 'Isaac',
      keyboard: 'Samuel Bellan',
      acousticGuitar: 'Beni'
    },
    confirmedMembers: ['Ana Mirian', 'Samuel Costa'],
    songs: [
      {
        id: 's3-1',
        title: 'Foi na Cruz',
        artist: 'Aline Barros',
        version: 'Versão Santa Ceia',
        key: 'D',
        originalKey: 'D',
        bpm: 65,
        youtubeUrl: 'https://www.youtube.com/watch?v=jW2mP_V1k-c',
        cifraUrl: '',
        notes: 'Ministração da ceia do pão e do cálice.',
        chordsText: `Tom: D
[Verso]
D         A/C#     Bm      Bm/A
 Foi na cruz, foi na cruz onde um dia eu vi
G          D/F#     Em     A
 Meu pecado castigado em Jesus`
      }
    ]
  },
  {
    id: 'scale-2026-11-22',
    date: '2026-11-22',
    title: 'Domingo - Culto dos Jovens',
    rehearsal: {
      date: '2026-11-21',
      time: '15:30',
      location: 'Templo Principal',
      notes: 'Passagem dos arranjos contemporâneos'
    },
    lineup: {
      ministration: 'Cris',
      vocals: ['Larissa', 'Thaissa'],
      bass: 'Joel Silva',
      drums: 'Davi Novaes',
      guitar1: 'Samuel Costa',
      guitar2: 'Isaac',
      keyboard: 'Lucas Bispo',
      acousticGuitar: 'Beni'
    },
    confirmedMembers: ['Cris', 'Joel Silva', 'Davi Novaes'],
    songs: [
      {
        id: 's4-1',
        title: 'A Casa É Sua',
        artist: 'Casa Worship',
        version: 'Casa Worship Oficial',
        key: 'G',
        originalKey: 'G',
        bpm: 72,
        youtubeUrl: 'https://www.youtube.com/watch?v=3W72N3y5KkQ',
        cifraUrl: '',
        notes: 'Essa casa é Sua casa, nós deixamos ela pra Você.',
        chordsText: `Tom: G
[Intro] C  Em  D  Am

[Refrão]
C
 Essa casa é Sua casa
Em
 Nós deixamos ela pra Você
D
 Jesus! Entra e toma o Teu lugar!`
      }
    ]
  },
  {
    id: 'scale-2026-11-29',
    date: '2026-11-29',
    title: 'Domingo - Culto de Encerramento do Mês',
    rehearsal: {
      date: '2026-11-28',
      time: '16:00',
      location: 'Templo Principal',
      notes: 'Alinhamento geral do louvor de gratidão'
    },
    lineup: {
      ministration: 'Samuel',
      vocals: ['Thaissa', 'Rebeca'],
      bass: 'Lucas Bispo',
      drums: 'Davi Novaes',
      guitar1: 'Isaac',
      guitar2: '',
      keyboard: 'Leandro Araújo',
      acousticGuitar: 'Beni'
    },
    confirmedMembers: ['Samuel', 'Leandro Araújo'],
    songs: [
      {
        id: 's5-1',
        title: 'Ousado Amor',
        artist: 'Isaías Saad',
        version: 'Isaías Saad Oficial',
        key: 'Bb',
        originalKey: 'Bb',
        bpm: 68,
        youtubeUrl: 'https://www.youtube.com/watch?v=yW6lGfUvG0s',
        cifraUrl: '',
        notes: 'Destaque para o refrão com todos os vocais em uníssono.',
        chordsText: `Tom: Bb
[Intro] Gm  F  Eb  Bb

[Refrão]
           Gm              F
Oh, impressionante, infinito
            Eb    Bb
E ousado amor de Deus!`
      }
    ]
  }
];

export const GOOGLE_DOCS_URL = "https://docs.google.com/document/d/1pwZTE4vqKx8dWo5ToAp35Avuz5zhuMcbWS-CSJEUODg/edit?usp=sharing";
