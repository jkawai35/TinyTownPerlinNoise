class Map1 extends Phaser.Scene{
    constructor() {
        super("Map1")
        this.noiseScale = 0.1;
        this.seed = Math.random();
    }

    create() {
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyPeriod = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD);
        keyComma = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA);
        this.keys = this.input.keyboard.createCursorKeys()

        map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 20, height: 15 });

        const tileset = map.addTilesetImage('tiles', null, 16, 16, 0, 0);
        this.groundLayer = map.createBlankLayer('Ground', tileset, 0, 0);
        this.decorationLayer = map.createBlankLayer('Decoration', tileset, 0, 0);
    
        this.generateMap(this.seed, map.width, map.height);

        this.hero = new Hero(this, game_width / 2, game_height / 2, 'hero', 0, 'down')

        this.physics.world.setBounds(0, 0, game_width, game_height)
    }

    generateMap(seed, mapWidth, mapHeight) {

        const roadBitmaskTable = {
          0: 25,
          1: 13,
          2: 26,
          3: 14,
          4: 37,
          6: 38,
          8: 24,
          9: 12,
          11: 13,
          12: 36,    
          14: 36,
          // Fallback
          default: 25
      };
    
        // Seed the Perlin noise (you can use a fixed seed for deterministic maps)
        //bit field approach
        noise.seed(seed);

        this.groundLayer.fill(-1);
        this.decorationLayer.fill(-1);
    
        for (let x = 0; x < mapWidth; x++) {
          for (let y = 0; y < mapHeight; y++) {
            const noiseValue = noise.perlin2(x * this.noiseScale, y * this.noiseScale);
    
            let groundIndex;
            let decorIndex;
            if (noiseValue < -0.2) {
              groundIndex = 0;
              if (noiseValue > -0.25){
                decorIndex = 28;
                //this.decorationLayer.putTileAt(decorIndex, x, y);
              } 
            } else if (noiseValue < 0.2) {
              groundIndex = 0;
            } else {
              groundIndex = 0;
            }
    
            this.groundLayer.putTileAt(groundIndex, x, y);
          }
        }

        noise.seed(Math.random());

        for (let x = 0; x < mapWidth; x++) {
          const noiseVal = noise.perlin2(x * 0.1, 100); // 1D noise
          const y = Math.floor((noiseVal + 1) / 2 * (mapHeight - 4)) + 2; // Keep road off edges

          // Draw a vertical strip of 3 road tiles for width
          for (let dy = -1; dy <= 0; dy++) {
            if (y + dy >= 0 && y + dy < mapHeight) {
              this.groundLayer.putTileAt(25, x, y + dy);
            } 
          }

          
          for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                const tile = this.groundLayer.getTileAt(x, y);
                if (tile.index == 25) {
                    let bitmask = this.getBitmask(x, y, this.roadLayer);
                    console.log(bitmask)
                    const index = roadBitmaskTable[bitmask];
                    this.groundLayer.putTileAt(index, x, y);
                    bitmask = 0;
                }
            }
        }
        
        }


    }

    adjustNoiseScale(delta) {
        this.noiseScale = Math.max(0.01, this.noiseScale + delta); // Prevents noiseScale from going too low
        this.generateMap(map.width, map.height);
    }

    getBitmask(x, y) {
      let bitmask = 0;
    
      let isGrass = (tx, ty) => {
        let tile = this.groundLayer.getTileAt(tx, ty);
        if (tile){
          print(tile)
        }
        if (tile && tile.index == 0){
          return true;
        }
        return false;
      };
    
      if (isGrass(x, y - 1)) bitmask += 1; // Up
      if (isGrass(x + 1, y)) bitmask += 2; // Right
      if (isGrass(x, y + 1)) bitmask += 4; // Down
      if (isGrass(x - 1, y)) bitmask += 8; // Left
    
      return bitmask;
    }

    update(){
        if (Phaser.Input.Keyboard.JustDown(keyR)){
            this.seed = Math.random();
            this.generateMap(this.seed, map.width, map.height)
        }
        if (Phaser.Input.Keyboard.JustDown(keyPeriod)){ 
            this.adjustNoiseScale(0.01)
            this.generateMap(this.seed, map.width, map.height)
        }

        if (Phaser.Input.Keyboard.JustDown(keyComma)){
            this.adjustNoiseScale(-0.01)
            this.generateMap(this.seed, map.width, map.height)

        }
        this.heroFSM.step()
        //this.hero.body
    }
}