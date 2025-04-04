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
                this.decorationLayer.putTileAt(decorIndex, x, y);
              } 
            } else if (noiseValue < 0.2) {
              groundIndex = 1;
            } else {
              groundIndex = 2;
            }
    
            this.groundLayer.putTileAt(groundIndex, x, y);
          }
        }
    }

    adjustNoiseScale(delta) {
        this.noiseScale = Math.max(0.01, this.noiseScale + delta); // Prevents noiseScale from going too low
        this.generateMap(map.width, map.height);
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