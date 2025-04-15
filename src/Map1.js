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

        this.messageE = this.add.text(game_width-50, game_height/2, 'East', {
          fontSize: '10px',
          fill: '#ffffff'
        });

        this.messageW = this.add.text(50, game_height/2, 'West', {
          fontSize: '10px',
          fill: '#ffffff'
        });

        this.messageN = this.add.text(game_width/2, 50, 'North', {
          fontSize: '10px',
          fill: '#ffffff'
        });

        this.messageS = this.add.text(game_width/2, game_height - 50, 'South', {
          fontSize: '10px',
          fill: '#ffffff'
        });

        this.messageMid = this.add.text(game_width/2, game_height/2, 'Mid', {
          fontSize: '10px',
          fill: '#ffffff'
        });

        this.messageW.setVisible(false);
        this.messageE.setVisible(false);
        this.messageN.setVisible(false);
        this.messageS.setVisible(false);
        this.messageMid.setVisible(false);

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
        default: 25
      };
    
      noise.seed(seed);
    
      this.groundLayer.fill(-1);
      this.decorationLayer.fill(-1);
    
      // First pass: generate base terrain and mark roads with base tile (25)
      for (let x = 0; x < mapWidth; x++) {    
        for (let y = 0; y < mapHeight; y++) {
          const noiseValue = noise.perlin2(x * this.noiseScale, y * this.noiseScale);
    
          let groundIndex = 0;
          this.groundLayer.putTileAt(groundIndex, x, y);

          if (noiseValue < .2 && noiseValue > -0.1) {
            this.groundLayer.putTileAt(1, x, y);
          }
          if (noiseValue < .1 && noiseValue > 0) {
            this.groundLayer.putTileAt(2, x, y);
          }
    
          // Overwrite with road tile in designated road area
          for (let x = 0; x < mapWidth - 1; x += 2) {
            for (let y = 0; y < mapHeight - 1; y += 2) {
              const roadNoise = noise.perlin2(x * this.noiseScale, y * this.noiseScale); // or whatever noise scale you want
              if (roadNoise < -0.15) {
                this.groundLayer.putTileAt(25, x, y);
                this.groundLayer.putTileAt(25, x + 1, y);
                this.groundLayer.putTileAt(25, x, y + 1);
                this.groundLayer.putTileAt(25, x + 1, y + 1);
              }
            }
          }
          
        }
      }
    
      // Second pass: apply bitmask and transition tile replacement
      for (let x = 0; x < mapWidth; x++) {
        for (let y = 0; y < mapHeight; y++) {
          const tile = this.groundLayer.getTileAt(x, y);
          if (tile && tile.index == 25) {
            const bitmask = this.getBitmask(x, y);
            const index = roadBitmaskTable[bitmask] ?? roadBitmaskTable.default;
            this.groundLayer.putTileAt(index, x, y);
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
          return tile && (tile.index == 0 || tile.index == 1 || tile.index == 2 || tile.index == 43);
        }
      };
    
      if (isGrass(x, y - 1)) {bitmask |= 1;} // Up
      if (isGrass(x + 1, y)) {bitmask |= 2;} // Right
      if (isGrass(x, y + 1)) {bitmask |= 4;} // Down
      if (isGrass(x - 1, y)) {bitmask |= 8;} // Left
    
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
        
        let posX = this.hero.x
        let posY = this.hero.y

        if (posX > 270 && posY > 50 && posY < 190){
          this.messageE.setVisible(true)
          this.messageW.setVisible(false);
          this.messageS.setVisible(false);
          this.messageN.setVisible(false);
          this.messageMid.setVisible(false);
        }else if (posX < 50 && posY > 50 && posY < 190){
          this.messageE.setVisible(false)
          this.messageW.setVisible(true);
          this.messageS.setVisible(false);
          this.messageN.setVisible(false);
          this.messageMid.setVisible(false);
        }else if (posY < 50){
          this.messageE.setVisible(false)
          this.messageW.setVisible(false);
          this.messageS.setVisible(false);
          this.messageN.setVisible(true);
          this.messageMid.setVisible(false);
        }else if (posY > 190){
          this.messageE.setVisible(false)
          this.messageW.setVisible(false);
          this.messageS.setVisible(true);
          this.messageN.setVisible(false);
          this.messageMid.setVisible(false);
        } else {
          this.messageE.setVisible(false)
          this.messageW.setVisible(false);
          this.messageS.setVisible(false);
          this.messageN.setVisible(false);
          this.messageMid.setVisible(true);
        }
        this.heroFSM.step()
        //this.hero.body
    }
}
