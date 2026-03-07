// nigeriaAddressData.js
// Exports: NIGERIA_ADDRESS_DATA, STATES, getLGAs, getCities, getTowns
// Towns are sample neighbourhoods/areas within each city.
// Extend the towns arrays as needed for your deployment.

export const NIGERIA_ADDRESS_DATA = {
  "Abia": {
    lgas: {
      "Aba North": {
        cities: ["Aba"],
        towns: { "Aba": ["Ariaria", "Eziama", "Ngwa Road", "Cemetery Road", "Asa Road"] }
      },
      "Aba South": {
        cities: ["Aba"],
        towns: { "Aba": ["Obuda", "Igwebuike", "Nkwoagu", "Obohia", "Uratta"] }
      },
      "Arochukwu": {
        cities: ["Arochukwu"],
        towns: { "Arochukwu": ["Ohafia", "Abam", "Ututu", "Ihechiowa"] }
      },
      "Umuahia North": {
        cities: ["Umuahia"],
        towns: { "Umuahia": ["Ibeku", "Nkwoagu", "Alaoji", "Ubakala"] }
      },
      "Umuahia South": {
        cities: ["Umuahia"],
        towns: { "Umuahia": ["Olokoro", "Ikwuano", "Ntigha", "Amuzukwu"] }
      },
    }
  },

  "Adamawa": {
    lgas: {
      "Yola North": {
        cities: ["Yola"],
        towns: { "Yola": ["Jimeta", "Doubeli", "Jambutu", "Wuro Hausa"] }
      },
      "Yola South": {
        cities: ["Yola"],
        towns: { "Yola": ["Rumde", "Adarawo", "Gwadabawa", "Karewa"] }
      },
      "Mubi North": {
        cities: ["Mubi"],
        towns: { "Mubi": ["Uba", "Bazza", "Michika", "Gulak"] }
      },
    }
  },

  "Akwa Ibom": {
    lgas: {
      "Uyo": {
        cities: ["Uyo"],
        towns: { "Uyo": ["Ewet Housing", "Shelter Afrique", "Itam", "Uruan", "Use Offot"] }
      },
      "Ikot Ekpene": {
        cities: ["Ikot Ekpene"],
        towns: { "Ikot Ekpene": ["Abak", "Ukanafun", "Essien Udim", "Etim Ekpo"] }
      },
      "Eket": {
        cities: ["Eket"],
        towns: { "Eket": ["Esit Eket", "Ibeno", "Ikot Abasi", "Onna"] }
      },
      "Essien Udim": {
        cities: ["Ukanafun", "Ikot Ekpene"],
        towns: {
          "Ukanafun": ["Abak", "Essien Udim", "Etim Ekpo", "Ika"],
          "Ikot Ekpene": ["Essien Udim", "Abak", "Ini", "Obot Akara"],
        }
      },
    }
  },

  "Anambra": {
    lgas: {
      "Onitsha North": {
        cities: ["Onitsha"],
        towns: { "Onitsha": ["GRA", "Trans-Ekulu", "Odoakpu", "Fegge", "Woliwo"] }
      },
      "Awka South": {
        cities: ["Awka"],
        towns: { "Awka": ["Amikwo", "Nibo", "Okpuno", "Nnewi Road"] }
      },
      "Nnewi North": {
        cities: ["Nnewi"],
        towns: { "Nnewi": ["Otolo", "Uruagu", "Umudim", "Nnewi South"] }
      },
    }
  },

  "Bauchi": {
    lgas: {
      "Bauchi": {
        cities: ["Bauchi"],
        towns: { "Bauchi": ["Wunti", "Birchi", "Miri", "GRA", "Yelwa"] }
      },
    }
  },

  "Bayelsa": {
    lgas: {
      "Yenagoa": {
        cities: ["Yenagoa"],
        towns: { "Yenagoa": ["Amarata", "Opolo", "Kpansia", "Ekeki", "Swali"] }
      },
    }
  },

  "Benue": {
    lgas: {
      "Makurdi": {
        cities: ["Makurdi"],
        towns: { "Makurdi": ["North Bank", "Wadata", "High Level", "Wurukum", "GRA"] }
      },
    }
  },

  "Borno": {
    lgas: {
      "Maiduguri": {
        cities: ["Maiduguri"],
        towns: { "Maiduguri": ["Bolori", "Gwange", "Old Maiduguri", "GRA", "Wulari"] }
      },
      "Jere": {
        cities: ["Maiduguri"],
        towns: { "Maiduguri": ["Jere", "Konduga", "Bama Road", "Gamboru"] }
      },
    }
  },

  "Cross River": {
    lgas: {
      "Calabar Municipal": {
        cities: ["Calabar"],
        towns: { "Calabar": ["Marian", "Nassarawa", "Diamond Hill", "State Housing"] }
      },
      "Calabar South": {
        cities: ["Calabar"],
        towns: { "Calabar": ["Nsefik", "Ekorinim", "Henshaw Town", "Ikot Ansa"] }
      },
    }
  },

  "Delta": {
    lgas: {
      "Warri South": {
        cities: ["Warri", "Effurun"],
        towns: {
          "Warri":   ["GRA", "Okumagba", "Igbudu", "Pessu", "Okere"],
          "Effurun": ["Udu", "Agbarho", "Uvwie", "Ekpan"],
        }
      },
      "Sapele": {
        cities: ["Sapele"],
        towns: { "Sapele": ["Ogorode", "Amukpe", "Ugboro", "GRA"] }
      },
      "Oshimili South": {
        cities: ["Asaba"],
        towns: { "Asaba": ["GRA", "Ibusa Road", "Summit", "Cable Point"] }
      },
    }
  },

  "Ebonyi": {
    lgas: {
      "Abakaliki": {
        cities: ["Abakaliki"],
        towns: { "Abakaliki": ["Kpirikpiri", "Nkwagu", "Amasiri", "GRA", "Mile 50"] }
      },
    }
  },

  "Edo": {
    lgas: {
      "Oredo": {
        cities: ["Benin City"],
        towns: { "Benin City": ["GRA", "Ring Road", "Sapele Road", "Ugbowo", "New Benin"] }
      },
      "Egor": {
        cities: ["Benin City"],
        towns: { "Benin City": ["Uselu", "Ugbowo", "Ekehuan Road", "Airport Road"] }
      },
      "Ikpoba-Okha": {
        cities: ["Benin City"],
        towns: { "Benin City": ["Aduwawa", "Ikpoba Hill", "Lucky Way", "Oregbeni"] }
      },
    }
  },

  "Ekiti": {
    lgas: {
      "Ado Ekiti": {
        cities: ["Ado Ekiti"],
        towns: { "Ado Ekiti": ["Basiri", "Ijigbo", "Oke-Ila", "Shasha", "Federal Housing"] }
      },
    }
  },

  "Enugu": {
    lgas: {
      "Enugu North": {
        cities: ["Enugu"],
        towns: { "Enugu": ["Achara Layout", "Ogui", "Coal Camp", "Abakpa", "Trans-Ekulu"] }
      },
      "Enugu South": {
        cities: ["Enugu"],
        towns: { "Enugu": ["Asata", "Abakpa", "Nike", "GRA", "New Haven"] }
      },
    }
  },

  "FCT": {
    lgas: {
      "Municipal Area Council": {
        cities: ["Abuja", "Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa", "Nyanya"],
        towns: {
          "Abuja":    ["Central Business District", "Maitama", "Asokoro", "Wuse 2", "Garki"],
          "Garki":    ["Garki I", "Garki II", "Area 1", "Area 2", "Area 3", "Area 10", "Area 11"],
          "Wuse":     ["Wuse I", "Wuse II", "Zone 3", "Zone 4", "Zone 5", "Zone 6", "Zone 7"],
          "Maitama":  ["Maitama I", "Maitama II", "Diplomatic Zone"],
          "Asokoro":  ["Asokoro I", "Asokoro II"],
          "Gwarinpa": ["1st Avenue", "2nd Avenue", "3rd Avenue", "Games Village"],
          "Kubwa":    ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Byazin", "Gbaruku"],
          "Nyanya":   ["Nyanya I", "Nyanya II", "Maraba", "Karu"],
        }
      },
      "Gwagwalada": {
        cities: ["Gwagwalada"],
        towns: { "Gwagwalada": ["Dobi", "Gwako", "Ibwa", "Ikwa", "Paikon-Kore"] }
      },
      "Bwari": {
        cities: ["Bwari"],
        towns: { "Bwari": ["Ushafa", "Dutse", "Kawu", "Igu", "Byui"] }
      },
      "Kuje": {
        cities: ["Kuje"],
        towns: { "Kuje": ["Chibiri", "Rubochi", "Gawu", "Kuje Market"] }
      },
      "Abaji": {
        cities: ["Abaji"],
        towns: { "Abaji": ["Yaba", "Nuku", "Gawu Babangida", "Rimba"] }
      },
      "Kwali": {
        cities: ["Kwali"],
        towns: { "Kwali": ["Pai", "Yangoji", "Dafa", "Wako"] }
      },
    }
  },

  "Gombe": {
    lgas: {
      "Gombe": {
        cities: ["Gombe"],
        towns: { "Gombe": ["Deba", "Pantami", "Tumfure", "GRA", "New Market"] }
      },
    }
  },

  "Imo": {
    lgas: {
      "Owerri Municipal": {
        cities: ["Owerri"],
        towns: { "Owerri": ["Ikenegbu", "Orji", "Aladinma", "World Bank", "GRA"] }
      },
    }
  },

  "Jigawa": {
    lgas: {
      "Dutse": {
        cities: ["Dutse"],
        towns: { "Dutse": ["GRA", "New Layout", "Old Town", "Market Area"] }
      },
    }
  },

  "Kaduna": {
    lgas: {
      "Kaduna North": {
        cities: ["Kaduna"],
        towns: { "Kaduna": ["Rigasa", "Ungwan Rimi", "Badiko", "Kawo", "Malali"] }
      },
      "Kaduna South": {
        cities: ["Kaduna"],
        towns: { "Kaduna": ["Tudun Wada", "Kabala", "Television", "Barnawa", "Gonin Gora"] }
      },
      "Zaria": {
        cities: ["Zaria"],
        towns: { "Zaria": ["Sabon Gari", "Tudun Wada", "Kwarbai", "GRA", "Samaru"] }
      },
    }
  },

  "Kano": {
    lgas: {
      "Kano Municipal": {
        cities: ["Kano"],
        towns: { "Kano": ["Sabon Gari", "Bompai", "Zoo Road", "Fagge", "Gwale", "Nasarawa"] }
      },
      "Fagge": {
        cities: ["Kano"],
        towns: { "Kano": ["Fagge A", "Fagge B", "Fagge C", "Gobirawa", "Kofar Wambai"] }
      },
      "Dala": {
        cities: ["Kano"],
        towns: { "Kano": ["Dala Hill", "Gyadi-Gyadi", "Kofar Mazugal"] }
      },
    }
  },

  "Katsina": {
    lgas: {
      "Katsina": {
        cities: ["Katsina"],
        towns: { "Katsina": ["GRA", "Kofar Kaura", "Tsohuwar Kasuwa", "Housing Estate"] }
      },
      "Funtua": {
        cities: ["Funtua"],
        towns: { "Funtua": ["Sabon Gari", "Old Layout", "New Layout"] }
      },
    }
  },

  "Kebbi": {
    lgas: {
      "Birnin Kebbi": {
        cities: ["Birnin Kebbi"],
        towns: { "Birnin Kebbi": ["GRA", "Tudun Wada", "Nasarawa", "Kalgo Road"] }
      },
    }
  },

  "Kogi": {
    lgas: {
      "Lokoja": {
        cities: ["Lokoja"],
        towns: { "Lokoja": ["Adankolo", "Gangare", "Old GRA", "New Layout", "Felele"] }
      },
    }
  },

  "Kwara": {
    lgas: {
      "Ilorin West": {
        cities: ["Ilorin"],
        towns: { "Ilorin": ["Oke-Ode", "Surulere", "GRA", "Fate", "Tanke"] }
      },
      "Ilorin East": {
        cities: ["Ilorin"],
        towns: { "Ilorin": ["Oke-Oyi", "Offa Garage", "Amilegbe", "Kulende"] }
      },
      "Ilorin South": {
        cities: ["Ilorin"],
        towns: { "Ilorin": ["Agbeyangi", "Coca-Cola", "Muritala", "Taiwo"] }
      },
    }
  },

  "Lagos": {
    lgas: {
      "Ikeja": {
        cities: ["Ikeja"],
        towns: { "Ikeja": ["GRA", "Allen Avenue", "Maryland", "Oregun", "Alausa"] }
      },
      "Lagos Island": {
        cities: ["Lagos Island"],
        towns: { "Lagos Island": ["Isale-Eko", "Marina", "Idumota", "Victoria Island", "Bar Beach"] }
      },
      "Eti-Osa": {
        cities: ["Victoria Island", "Lekki", "Ajah"],
        towns: {
          "Victoria Island": ["Ahmadu Bello Way", "Adeola Odeku", "Sanusi Fafunwa", "Bishop Aboyade"],
          "Lekki":           ["Phase 1", "Phase 2", "Chevron", "Ikota", "Ajah"],
          "Ajah":            ["Sangotedo", "Abijo", "Awoyaya", "Ogombo"],
        }
      },
      "Alimosho": {
        cities: ["Alimosho", "Egbeda", "Ipaja", "Agbado"],
        towns: {
          "Alimosho": ["Egbeda", "Ikotun", "Ijegun", "Igando"],
          "Egbeda":   ["Idimu", "Akowonjo", "Shasha", "Dopemu"],
          "Ipaja":    ["Ayobo", "Ipaja Road", "Command"],
          "Agbado":   ["Agbado", "Ifako", "Alakuko"],
        }
      },
      "Surulere": {
        cities: ["Surulere"],
        towns: { "Surulere": ["Bode Thomas", "Ojuelegba", "Aguda", "Eric Moore", "Itire"] }
      },
      "Kosofe": {
        cities: ["Kosofe"],
        towns: { "Kosofe": ["Ketu", "Ojota", "Ikosi", "Mile 12", "Oworo"] }
      },
      "Mushin": {
        cities: ["Mushin"],
        towns: { "Mushin": ["Idi-Araba", "Ojuwoye", "Papa Ajao", "New Garage"] }
      },
      "Apapa": {
        cities: ["Apapa"],
        towns: { "Apapa": ["GRA", "Olodi", "Iganmu", "Wharf Road"] }
      },
      "Amuwo-Odofin": {
        cities: ["Festac Town", "Mile 2"],
        towns: {
          "Festac Town": ["1st Avenue", "2nd Avenue", "21 Road", "22 Road"],
          "Mile 2":      ["Ago Palace", "Kirikiri", "Apple Junction"],
        }
      },
      "Ikorodu": {
        cities: ["Ikorodu"],
        towns: { "Ikorodu": ["Imota", "Ijede", "Igbogbo", "Bayeku", "Odogunyan"] }
      },
      "Badagry": {
        cities: ["Badagry"],
        towns: { "Badagry": ["Ajara", "Ganyingbo", "Topo", "Awhanjigo"] }
      },
      "Lagos Mainland": {
        cities: ["Ebute Meta", "Yaba", "Surulere"],
        towns: {
          "Ebute Meta": ["Ebute Meta East", "Ebute Meta West", "Oyingbo"],
          "Yaba":       ["Abule Ijesha", "Sabo", "Iwaya", "Onike"],
          "Surulere":   ["Bode Thomas", "Ojuelegba", "Aguda"],
        }
      },
    }
  },

  "Nasarawa": {
    lgas: {
      "Lafia": {
        cities: ["Lafia"],
        towns: { "Lafia": ["GRA", "New Market", "Lafia Road", "Hospital Road"] }
      },
      "Keffi": {
        cities: ["Keffi"],
        towns: { "Keffi": ["Old Keffi", "New Layout", "Sabon Gari"] }
      },
    }
  },

  "Niger": {
    lgas: {
      "Chanchaga": {
        cities: ["Minna"],
        towns: { "Minna": ["Bosso", "Maitumbi", "Kpakungu", "Tunga", "GRA"] }
      },
      "Bosso": {
        cities: ["Minna"],
        towns: { "Minna": ["Bosso Estate", "Kampala", "Tayi"] }
      },
    }
  },

  "Ogun": {
    lgas: {
      "Abeokuta North": {
        cities: ["Abeokuta"],
        towns: { "Abeokuta": ["Itoku", "Iberekodo", "Oke-Lantoro", "Lafenwa", "Panseke"] }
      },
      "Abeokuta South": {
        cities: ["Abeokuta"],
        towns: { "Abeokuta": ["Oke-Ilewo", "Adatan", "Isale-Igbehin", "Asero"] }
      },
      "Ado-Odo/Ota": {
        cities: ["Ota", "Ado-Odo"],
        towns: {
          "Ota":     ["Sango-Ota", "Agbara", "Ifo", "Ota Industrial"],
          "Ado-Odo": ["Ado Market", "Owode", "Agbara Estate"],
        }
      },
      "Ijebu Ode": {
        cities: ["Ijebu Ode"],
        towns: { "Ijebu Ode": ["Oke-Agbo", "Ijasi", "Itoro", "Odosenlu"] }
      },
    }
  },

  "Ondo": {
    lgas: {
      "Akure South": {
        cities: ["Akure"],
        towns: { "Akure": ["Oke-Ijebu", "Alagbaka", "FUTA Road", "Shagari Village", "GRA"] }
      },
      "Akure North": {
        cities: ["Akure"],
        towns: { "Akure": ["Oba-Ile", "Igoba", "Eleganzz", "Obanla"] }
      },
    }
  },

  "Osun": {
    lgas: {
      "Osogbo": {
        cities: ["Osogbo"],
        towns: { "Osogbo": ["Oke-Baale", "Station Road", "Alekuwodo", "Ogo-Oluwa", "GRA"] }
      },
      "Ife Central": {
        cities: ["Ile-Ife"],
        towns: { "Ile-Ife": ["Mayfair", "Lagere", "Eleyele", "Parakin"] }
      },
    }
  },

  "Oyo": {
    lgas: {
      "Ibadan North": {
        cities: ["Ibadan"],
        towns: { "Ibadan": ["Agodi", "Mokola", "Oke-Ado", "Bodija", "Idi-Ishin"] }
      },
      "Ibadan North East": {
        cities: ["Ibadan"],
        towns: { "Ibadan": ["Ring Road", "Challenge", "New Ife Road", "Iwo Road"] }
      },
      "Ibadan South West": {
        cities: ["Ibadan"],
        towns: { "Ibadan": ["Iyaganku", "Ring Road", "Bashorun", "Adamasingba"] }
      },
      "Ibadan South East": {
        cities: ["Ibadan"],
        towns: { "Ibadan": ["Iyaganku GRA", "Agodi GRA", "Dugbe", "Gbagi"] }
      },
      "Oluyole": {
        cities: ["Ibadan"],
        towns: { "Ibadan": ["Oluyole Estate", "Idi-Ayunre", "Ologuneru", "Egbeda"] }
      },
      "Oyo East": {
        cities: ["Oyo"],
        towns: { "Oyo": ["Isale-Oyo", "Awe Road", "Owode", "Surulere"] }
      },
    }
  },

  "Plateau": {
    lgas: {
      "Jos North": {
        cities: ["Jos"],
        towns: { "Jos": ["Bauchi Road", "Terminus", "Farin Gada", "Angwan Rukuba", "GRA"] }
      },
      "Jos South": {
        cities: ["Bukuru", "Jos"],
        towns: {
          "Bukuru": ["Rantya", "Gyel", "Kuru", "Angwan Rogo"],
          "Jos":    ["Rayfield", "Vom Road", "Anglo-Jos"],
        }
      },
    }
  },

  "Rivers": {
    lgas: {
      "Port Harcourt": {
        cities: ["Port Harcourt"],
        towns: { "Port Harcourt": ["GRA", "Old GRA", "Rumuola", "Mile 3", "Creek Road", "Diobu", "Trans-Amadi"] }
      },
      "Obio/Akpor": {
        cities: ["Rumuola"],
        towns: { "Rumuola": ["Rumuokoro", "Rumuibekwe", "Rukpokwu", "Rumuola", "Eliozu"] }
      },
      "Eleme": {
        cities: ["Eleme"],
        towns: { "Eleme": ["Ogale", "Ebubu", "Aleto", "Alesa"] }
      },
    }
  },

  "Sokoto": {
    lgas: {
      "Sokoto North": {
        cities: ["Sokoto"],
        towns: { "Sokoto": ["Gawon Nama", "Mabera", "Runjin Sambo", "GRA", "New Layout"] }
      },
      "Sokoto South": {
        cities: ["Sokoto"],
        towns: { "Sokoto": ["Arkilla", "Gidan Igwai", "Dundaye", "Kangiwa"] }
      },
    }
  },

  "Taraba": {
    lgas: {
      "Jalingo": {
        cities: ["Jalingo"],
        towns: { "Jalingo": ["GRA", "New Layout", "Barade", "Turaki Estate"] }
      },
    }
  },

  "Yobe": {
    lgas: {
      "Damaturu": {
        cities: ["Damaturu"],
        towns: { "Damaturu": ["GRA", "New Layout", "Pompomari", "Federal Housing"] }
      },
    }
  },

  "Zamfara": {
    lgas: {
      "Gusau": {
        cities: ["Gusau"],
        towns: { "Gusau": ["GRA", "Sabon Gari", "Tudun Wada", "Yerima"] }
      },
    }
  },

  // ── Remaining states with basic structure ─────────────────
  "Anambra": {
    lgas: {
      "Onitsha North": {
        cities: ["Onitsha"],
        towns: { "Onitsha": ["GRA", "Trans-Ekulu", "Odoakpu", "Fegge"] }
      },
    }
  },
};

// ── Exports ──────────────────────────────────────────────────

export const STATES = Object.keys(NIGERIA_ADDRESS_DATA).sort();

export function getLGAs(state) {
  if (!state || !NIGERIA_ADDRESS_DATA[state]) return [];
  return Object.keys(NIGERIA_ADDRESS_DATA[state].lgas).sort();
}

export function getCities(state, lga) {
  if (!state || !lga) return [];
  return NIGERIA_ADDRESS_DATA[state]?.lgas[lga]?.cities || [];
}

export function getTowns(state, lga, city) {
  if (!state || !lga || !city) return [];
  return NIGERIA_ADDRESS_DATA[state]?.lgas[lga]?.towns?.[city] || [];
}