ym.modules.define('km.Data.Poi', [
], function (provide) {

var Poi = [{
    name: "точки гідратації",
    id: 'g1',
    preset: "islands#blueHydroCircleIcon",
    items: [
      {
        center: [50.45249042686838, 30.534683879745398],
        icon: "img/water_pin.png"
      }, {
        center: [50.428776929785386, 30.563163575065527],
        icon: "img/water_pin.png"
      }, {
        center: [50.428776929785386, 30.563163575065527],
        icon: "img/water_pin.png"
      }, {
        center: [50.436184826456284, 30.609935935867174],
        icon: "img/water_pin.png"
      }, {
        center: [50.41807437080136, 30.544398840797335],
        icon: "img/water_pin.png"
      }, {
        center: [50.447147196896935, 30.52116554631033],
        icon: "img/water_pin.png"
      }, {
        center: [50.47001282202074, 30.51838141335287],
        icon: "img/water_pin.png"
      }, {
        center: [50.46259980184927, 30.489837345016372],
        icon: "img/water_pin.png"
      }, {
        center: [50.45389138621922, 30.504659232032672],
        icon: "img/water_pin.png"
      }, {
        center: [50.455093319128224, 30.52172344578543],
        icon: "img/water_pin.png"
      }, {
        center: [50.44551505821562, 30.500991922953038],
        icon: "img/water_pin.png"
      }, {
        center: [50.44791446722145, 30.483271297347915],
        icon: "img/water_pin.png"
      }, {
        center: [50.43569145975508, 30.5186764563445],
        icon: "img/water_pin.png"
      }
    ]
  }, {
    name: "ізотонік",
    id: 'g11',
    preset: "islands#blueBarCircleIcon",
    items: [
      {
        center: [50.45249042686838, 30.534683879745398],
        icon: "img/water_pin3.png"
      }, {
        center: [50.428776929785386, 30.563163575065527],
        icon: "img/water_pin3.png"
      }, {
        center: [50.428776929785386, 30.563163575065527],
        icon: "img/water_pin3.png"
      }, {
        center: [50.436184826456284, 30.609935935867174],
        icon: "img/water_pin3.png"
      }, {
        center: [50.41807437080136, 30.544398840797335],
        icon: "img/water_pin3.png"
      }, {
        center: [50.447147196896935, 30.52116554631033],
        icon: "img/water_pin3.png"
      }, {
        center: [50.47001282202074, 30.51838141335287],
        icon: "img/water_pin3.png"
      }, {
        center: [50.46259980184927, 30.489837345016372],
        icon: "img/water_pin3.png"
      }, {
        center: [50.45389138621922, 30.504659232032672],
        icon: "img/water_pin3.png"
      }, {
        center: [50.455093319128224, 30.52172344578543],
        icon: "img/water_pin3.png"
      }, {
        center: [50.44551505821562, 30.500991922953038],
        icon: "img/water_pin3.png"
      }, {
        center: [50.44791446722145, 30.483271297347915],
        icon: "img/water_pin3.png"
      }, {
        center: [50.43569145975508, 30.5186764563445],
        icon: "img/water_pin3.png"
      }
    ]
  },
  {
    name: "пункти харчування",
    preset: "islands#blueFoodCircleIcon",
    id: 'g6',
    items: [{
        center: [50.41807437080136, 30.544398840797335],
        icon: "img/food_pin2.png"
      }, {
        center: [50.447147196896935, 30.52116554631033],
        icon: "img/food_pin2.png"
      }, {
        center: [50.47001282202074, 30.51838141335287],
        icon: "img/food_pin2.png"
      }, {
        center: [50.45389138621922, 30.504659232032672],
        icon: "img/food_pin2.png"
      }, {
        center: [50.44551505821562, 30.500991922953038],
        icon: "img/food_pin2.png"
      }, {
        center: [50.43569145975508, 30.5186764563445],
        icon: "img/food_pin2.png"
      }
    ]
  },
  {
    name: "медична допомога",
    id: 'g2',
    preset: "islands#blueMedicalCircleIcon",
    items: [
      {
        center: [50.448517313701075, 30.523182567489524],
        icon: "img/medical_pin.png"
      }, {
        center: [50.41807437080136, 30.544398840797335],
        icon: "img/medical_pin.png"
      }, {
        center: [50.447147196896935, 30.52116554631033],
        icon: "img/medical_pin.png"
      }, {
        center: [50.47001282202074, 30.51838141335287],
        icon: "img/medical_pin.png"
      }, {
        center: [50.45389138621922, 30.504659232032672],
        icon: "img/medical_pin.png"
      }, {
        center: [50.44551505821562, 30.500991922953038],
        icon: "img/medical_pin.png"
      }, {
        center: [50.44791446722145, 30.483271297347915],
        icon: "img/medical_pin.png"
      }, {
        center: [50.43569145975508, 30.5186764563445],
        icon: "img/medical_pin.png"
      }
    ]
  },
  {
    name: "губки",
    preset: "islands#blueWaterParkCircleIcon",
    id: 'g3',
    items: [{
        center: [50.436184826456284, 30.609935935867174],
        icon: "img/water_pin2.png"
      }, {
        center: [50.447147196896935, 30.52116554631033],
        icon: "img/water_pin2.png"
      }, {
        center: [50.46259980184927, 30.489837345016372],
        icon: "img/water_pin2.png"
      }, {
        center: [50.455093319128224, 30.52172344578543],
        icon: "img/water_pin2.png"
      }, {
        center: [50.44791446722145, 30.483271297347915],
        icon: "img/water_pin2.png"
      }
    ]
  },
  {
    name: "пункти масажу",
    preset: "islands#blueHotelCircleIcon",
    id: 'g4',
    items: [{
        center: [50.448517313701075, 30.523182567489524],
        icon: "img/masage_pin.png"
      }, {
        center: [50.41807437080136, 30.544398840797335],
        icon: "img/masage_pin.png"
      }, {
        center: [50.447147196896935, 30.52116554631033],
        icon: "img/masage_pin.png"
      }, {
        center: [50.44551505821562, 30.500991922953038],
        icon: "img/masage_pin.png"
      }
    ]
  }, {
    name: "точки передачі естафети",
    preset: "islands#blueRunCircleIcon",
    id: 'g0',
    items: [
      {
        center: [50.436184826456284, 30.609935935867174],
        icon: "img/estafeta_pin.png"
      }, {
        center: [50.447147196896935, 30.52116554631033],
        icon: "img/estafeta_pin.png"
      }, {
        center: [50.45389138621922, 30.504659232032672],
        icon: "img/estafeta_pin.png"
      }
    ]
  },
  {
    name: "музичні точки підтримки",
    preset: "islands#blueNightClubCircleIcon",
    id: 'g8',
    items: [{
        center: [50.436184826456284, 30.609935935867174],
        icon: "img/music_pin.png"
      }, {
        center: [50.447147196896935, 30.52116554631033],
        icon: "img/music_pin.png"
      }, {
        center: [50.45389138621922, 30.504659232032672],
        icon: "img/music_pin.png"
      }
    ]
  },
  /*
            {
            name: "індивідуальне харчування (6)",
            preset: "islands#blueFoodCircleIcon",
            id:'g6',
            items: [

                { center: [50.41807437080136,30.544398840797335], icon: "img/food_pin2.png"},
                { center: [50.447147196896935,30.52116554631033], icon: "img/food_pin2.png"},
                { center: [50.47001282202074,30.51838141335287], icon: "img/food_pin2.png"},
                { center: [50.45389138621922,30.504659232032672], icon: "img/food_pin2.png"},
                { center: [50.44551505821562,30.500991922953038], icon: "img/food_pin2.png"},
                { center: [50.43569145975508,30.5186764563445], icon: "img/food_pin2.png"}

            ]},
            */
  {
    name: "туалети",
    preset: "islands#blueToiletCircleIcon",
    id: 'g9',
    items: [{
        center: [50.448517313701075, 30.523182567489524],
        icon: "img/wc_pin.png"
      }, {
        center: [50.428776929785386, 30.563163575065527],
        icon: "img/wc_pin.png"
      }, {
        center: [50.436184826456284, 30.609935935867174],
        icon: "img/wc_pin.png"
      }, {
        center: [50.41807437080136, 30.544398840797335],
        icon: "img/wc_pin.png"
      }, {
        center: [50.447147196896935, 30.52116554631033],
        icon: "img/wc_pin.png"
      }, {
        center: [50.47001282202074, 30.51838141335287],
        icon: "img/wc_pin.png"
      }, {
        center: [50.45389138621922, 30.504659232032672],
        icon: "img/wc_pin.png"
      }, {
        center: [50.44551505821562, 30.500991922953038],
        icon: "img/wc_pin.png"
      }, {
        center: [50.43569145975508, 30.5186764563445],
        icon: "img/wc_pin.png"
      },
    ]
  },
  {
    name: "зони підтримки учасників",
    preset: "islands#blueHomeCircleIcon",
    id: 'g7',
    items: [{
        center: [50.448517313701075, 30.523182567489524],
        icon: "img/fan_pin2.png"
      }, {
        center: [50.4305930344855, 30.55957477940358],
        icon: "img/fan_pin2.png"
      }, {
        center: [50.436184826456284, 30.609935935867174],
        icon: "img/fan_pin2.png"
      }, {
        center: [50.42277986023473, 30.555841144454863],
        icon: "img/fan_pin2.png"
      }, {
        center: [50.424260350673904, 30.517946895492454],
        icon: "img/fan_pin2.png"
      }, {
        center: [50.461010938288766, 30.521079715621852],
        icon: "img/fan_pin2.png"
      }, {
        center: [50.46232586368494, 30.50666015995779],
        icon: "img/fan_pin2.png"
      }, {
        center: [50.45389138621922, 30.504659232032672],
        icon: "img/fan_pin2.png"
      }, {
        center: [50.453641196993324, 30.516187366378702],
        icon: "img/fan_pin2.png"
      }, {
        center: [50.44551505821562, 30.500991922953038],
        icon: "img/fan_pin2.png"
      }, {
        center: [50.43569145975508, 30.5186764563445],
        icon: "img/fan_pin2.png"
      }
    ]
  },
];

  provide(Poi);
});
