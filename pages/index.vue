<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex xs12 style="width: 100%">
      <div class="text-xs-center">
        <v-btn>test</v-btn>
      </div>
      initStatus alpha {{ initStatus.alpha }}<br>
      currentStatus alpha {{ currentStatus.alpha }}<br>
      display alpha {{ displayStatus.alpha }}<br>
      ball acc {{ ballStatus.dimensions.y.acceleration }}<br>
      ball speed {{ ballStatus.dimensions.y.speed }}<br>
      ball y {{ ballStatus.dimensions.y.coordinate }}<br>
      leftPosition() {{ leftPosition() }}<br>
      leftPosition() {{ topPosition() }}<br>
      <v-container fluid>
        <v-text-field label="alpha" :value="displayStatus.alpha"></v-text-field>
        <v-text-field label="beta" :value="displayStatus.beta"></v-text-field>
        <v-text-field label="gamma" :value="displayStatus.gamma"></v-text-field>
        <div class="rolling-container">
          <div class="ball" :style="{ left: leftPosition(), top: topPosition() }"></div>
        </div>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">

  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {}
  })
  export default class IndexPage extends Vue {

    isInit        = false;
    initStatus    = new AngularState();
    currentStatus = new AngularState();
    displayStatus = new AngularState();
    ballStatus    = new BallStatus();
    message       = '?';

    leftPosition () {
      return `calc( 100% / 2 - 10px - ${this.ballStatus.dimensions.x.coordinate}px )`;
    }
    topPosition () {
      return `calc( 100% / 2 - 10px - ${this.ballStatus.dimensions.y.coordinate}px )`;
    }

    handleOrientation ( event: any ) {
      const { alpha, beta, gamma } = event;

      if ( !this.isInit ) { // 初回だけ初期値を更新する
        this.initStatus = { alpha, beta, gamma };
        this.isInit = true;
      }
      this.currentStatus = { alpha, beta, gamma };
    };

    mounted(): void {
      window.addEventListener( "deviceorientation", this.handleOrientation, true );

      setInterval( () => {
        this.displayStatus = updatePositions( this.currentStatus, this.initStatus );
        this.ballStatus.set( 'x', this.displayStatus );
        this.ballStatus.set( 'y', this.displayStatus );
      }, 40 );
    }
  }

  const updatePositions = ( { alpha, beta, gamma }: AngularState, initialState: AngularState ): AngularState => {
    const newState = new AngularState();
    newState.alpha = Math.round( ( alpha - initialState.alpha ) * 100 ) / 100;
    newState.beta = Math.round( ( beta - initialState.beta ) * 100 ) / 100;
    newState.gamma = Math.round( ( gamma - initialState.gamma ) * 100 ) / 100;
    if ( alpha < 0 ) {
      newState.alpha += 360;
    }
    console.log( 'update state', beta, beta < 0 );
    if ( newState.beta < 0 ) {
      newState.beta += 360;
    }
    if ( gamma < 0 ) {
      newState.gamma += 360;
    }
    return newState;
  };

  const getAcceleration = ( deg: number ): number => {
    let angular = 0;
    // if ( dimension === 'alpha' ) {
      if ( 180 < deg && deg < 360 ) { // 右傾き
        if ( deg < 270 ) {
          angular =  90;
        } else {
          angular =  deg - 360;
        }
      } else if ( 180 > deg && deg > 0 ) { // 左傾き
        if ( deg > 90 ) {
          angular =  90;
        } else {
          angular =  deg;
        }
      }
    // }

    console.log( 'angular ', angular );
    console.log( 'Math.sin( angular ) ', Math.sin( angular ) );
    angular = angular * ( Math.PI / 180 );
    return Math.sin( angular );
  };

  export class AngularState {
    alpha: number = 0;
    beta: number = 0;
    gamma: number = 0;
  }

  export type GyroDimension = 'alpha' | 'beta' | 'gamma';
  export type BallDimension = 'x' | 'y';
  export const DirectionMap: { [key: string]: GyroDimension } = {
    x: 'alpha',
    y: 'beta'
  };
  export class BallStatus {
    dimensions = {
      x: new BallPosition(),
      y: new BallPosition()
    };

    set( dimension: BallDimension, state: AngularState ) {
      const deg = state[DirectionMap[dimension]];
      console.log( 'deg', dimension, deg );
      const target = this.dimensions[dimension];
      target.acceleration = - getAcceleration( deg );
      console.log( 'acc', dimension, target.acceleration );
      target.speed += Math.round( target.acceleration * 100 ) / 100;
      target.coordinate += Math.round( target.speed );
    }
  }

  export class BallPosition {
    acceleration: number = 0;
    speed: number = 0;
    coordinate: number = 0;
  }
</script>

<style lang="scss">
  .rolling-container {
    background: white;
    height: 300px;
    border: solid 1px dimgray;
    border-radius: 8px;
    position: relative;

    .ball {
      height: 20px;
      width: 20px;
      border-radius: 10px;
      background: #41b883;
      position: absolute;
      left: calc( 100% / 2 - 10px );
      top: calc( 100% / 2 - 10px );
    }
  }


</style>
