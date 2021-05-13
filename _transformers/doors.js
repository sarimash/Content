
const YAML = require('js-yaml');
const fs = require('fs');

const connectOptions = {undefined:0b000_0_0_000, horizontal: 0b000_1_1_000, vertical: 0b010_0_0_010}
const setOptions = {undefined:'Decor', decor: 'Decor', wall: 'Walls'}
const stateOptions = {opened:'opened', revealed: 'revealed', hidden: 'hidden', default: 'default'}

const merge = async () => {
  try {
    const rawDoors = YAML.load(fs.readFileSync(`./spritesData/doors.yml`));
    console.log(`Loading ${rawDoors.length} doors...`);

    const outputDoors = rawDoors.map((rawDoor, index) => {
      if (rawDoor.id == null) throw Error(`door(${index}th) - missing id`);
      const doorLogPrefix = `door(id:${rawDoor.id})`;

      const outputDoor = {
        tiledId: rawDoor.id,
        direction: connectOptions[rawDoor.connect],
        states: Object.keys(rawDoor.states).reduce((states, stateName) => {
          const state = stateOptions[stateName];
          if (state == null) throw Error(`${doorLogPrefix} - state ${stateName} is invalid`);
          states[state] = rawDoor.states[state].map(sprite=>{
            const newSprite = makeSprite(sprite.x, sprite.y, sprite.id, sprite.set);
            if (typeof newSprite === 'string') throw new Error(`${doorLogPrefix}(states.${state}) ${newSprite}`);
            return newSprite;
          });
          return states;
        }, {})
      };

      if (outputDoor.direction == null) throw Error(`${doorLogPrefix} - connect '${rawDoor.connect}' is invalid`);

      if (!outputDoor.states['default']) {
        outputDoor.states['default'] = [
          makeSprite(0, 0, rawDoor.id, undefined)
        ];
      }

      return outputDoor;

      function makeSprite(x, y, id, set) {
        const sprite = {
          x: x || 0,
          y: y || 0,
          spritesheetId: id,
          spritesheetName: setOptions[set]
        };
        if (isNaN(sprite.x)) return `x '${x}' is invalid`;
        if (isNaN(sprite.y)) return `y '${y}' is invalid`;
        if (isNaN(sprite.spritesheetId)) return `id '${id}' is invalid`;
        if (typeof sprite.spritesheetName  !== 'string') return `set '${set}' is not an option`;
        return sprite;
      }
    });

    if(!fs.existsSync('_output')) fs.mkdirSync('_output');
    fs.writeFileSync('_output/sprite-data.json', JSON.stringify({doorStates: outputDoors}, null, 4));

  } catch(e) {
    console.error(e);
    process.exit(-1);
  }

};

merge();