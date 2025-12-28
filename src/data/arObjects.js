/**
 * Données des objets AR détectables
 * Chaque objet contient un nom, une icône et une histoire de 25 lignes
 */

export const arObjects = {
  personne: {
    id: 'personne',
    name: 'Portrait',
    icon: '👤',
    story: `Dans cette image, on découvre une personne capturée dans un moment de grâce. 
Le portrait révèle une beauté naturelle, avec des traits harmonieux qui racontent une histoire silencieuse. 
Les yeux, fenêtres de l'âme, semblent porter des souvenirs et des rêves inexprimés. 
La chevelure brune cascade avec élégance, encadrant un visage empreint de sérénité. 
La jacquette et la chemise suggèrent un style raffiné, mélangeant confort et élégance. 
Cette image capture plus qu'une simple représentation physique ; elle immortalise une essence, 
un instant de vie suspendu dans le temps. Chaque détail, des plis du vêtement aux nuances de la peau, 
contribue à créer une œuvre d'art vivante. La lumière joue avec les contours, sculptant des ombres 
qui ajoutent de la profondeur et du mystère. Cette personne semble porter en elle une sagesse tranquille, 
une beauté intérieure qui transcende l'apparence. Le portrait invite à la contemplation, 
à la découverte de l'histoire qui se cache derrière ce regard. C'est une célébration de l'humanité, 
une ode à la diversité et à la singularité de chaque individu. Dans ce moment figé, 
on perçoit l'éternité d'un instant, la poésie d'une existence.`
  },
  montre: {
    id: 'montre',
    name: 'Montre',
    icon: '⌚',
    story: `Cette montre est bien plus qu'un simple instrument de mesure du temps. 
Elle incarne l'art de l'horlogerie, où chaque mécanisme raffiné raconte une histoire de précision et d'élégance. 
Le cadran, avec ses aiguilles qui dansent en silence, marque les moments précieux de la vie. 
Chaque tic-tac est un battement de cœur mécanique, rappelant que le temps est notre bien le plus précieux. 
Le boîtier, finement travaillé, protège un univers de rouages et d'engrenages qui fonctionnent en parfaite harmonie. 
Le bracelet, qu'il soit en cuir, en métal ou en tissu, épouse le poignet comme une seconde peau, 
devenant un compagnon fidèle au quotidien. Cette montre a peut-être été transmise de génération en génération, 
portant en elle les souvenirs de ceux qui l'ont portée. Elle a été témoin de moments joyeux et de moments difficiles, 
de rendez-vous importants et de simples instants de contemplation. Dans un monde où tout va vite, 
elle rappelle l'importance de prendre son temps, de savourer chaque seconde. Elle est un symbole de permanence 
dans un monde éphémère, un lien entre le passé, le présent et l'avenir. Cette montre n'est pas seulement un objet, 
elle est un héritage, une tradition, une œuvre d'art qui transcende sa fonction première.`
  },
  télé: {
    id: 'télé',
    name: 'Télévision',
    icon: '📺',
    story: `Cette télévision est bien plus qu'un simple écran ; c'est une fenêtre ouverte sur le monde. 
Elle a été le témoin silencieux de tant d'histoires, de nouvelles, de films et de moments partagés en famille. 
L'écran, comme un miroir magique, reflète nos émotions, nos rires, nos larmes et nos rêves. 
Dans le confort de cette chambre, elle devient un compagnon fidèle, offrant divertissement et information. 
Chaque pixel raconte une histoire, chaque image projetée transporte vers d'autres univers. 
Cette télévision a vu défiler les actualités du monde, les séries qui ont marqué une génération, 
les films qui ont fait rêver. Elle a été le centre de rassemblement lors des soirées, 
créant des liens et des souvenirs inoubliables. Dans l'obscurité de la nuit, 
sa lumière douce éclaire la pièce, créant une atmosphère chaleureuse et apaisante. 
Elle est le gardien des traditions, transmettant les valeurs et les cultures à travers ses programmes. 
Cette télévision n'est pas seulement un objet technologique, elle est un pont entre les générations, 
un moyen de partage et de découverte. Elle rappelle que même dans notre monde connecté, 
il y a une magie particulière à se rassembler autour d'un écran pour partager une expérience commune.`
  }
};

/**
 * Obtenir les informations d'un objet par son ID
 */
export const getObjectInfo = (objectId) => {
  return arObjects[objectId] || null;
};

/**
 * Obtenir tous les objets
 */
export const getAllObjects = () => {
  return Object.values(arObjects);
};

