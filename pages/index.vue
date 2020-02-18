<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex xs12 style="width: 100%">
      <v-container fluid>
        <v-text-field label="alpha" :value="displayStatus.alpha"></v-text-field>
        <v-text-field label="beta" :value="displayStatus.beta"></v-text-field>
        <v-text-field label="gamma" :value="displayStatus.gamma"></v-text-field>
        <div class="text-xs-center">
          <v-btn color="primary" @click="calibration()">キャリブレーション</v-btn>
        </div>
        <div class="rolling-container" :style="{ height: `${boardLength}px`, width: `${boardLength}px` }">
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
    boardLength = 300;
    message       = '?';


    leftPosition () {
      return `calc( 100% / 2 - 10px - ${this.ballStatus.dimensions.x.coordinate}px )`;
    }
    topPosition () {
      return `calc( 100% / 2 - 10px - ${this.ballStatus.dimensions.y.coordinate}px )`;
    }

    calibration() {
      this.initStatus = { ...this.currentStatus };
      this.displayStatus = new AngularState();
      this.ballStatus = new BallStatus();
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
      if ( DeviceOrientationEvent ) {
        DeviceOrientationEvent && (DeviceOrientationEvent as any).requestPermission && ( DeviceOrientationEvent as any ).requestPermission();
      }
      window.addEventListener( "deviceorientation", this.handleOrientation, true );

      setInterval( () => {
        this.displayStatus = updatePositions( this.currentStatus, this.initStatus );
        this.ballStatus.set( 'x', this.displayStatus, this.boardLength / 2 - 10 );
        this.ballStatus.set( 'y', this.displayStatus, this.boardLength / 2 - 10 );
      }, 33 );
    }
  }

  const updatePositions = ( { alpha, beta, gamma }: AngularState, initialState: AngularState ): AngularState => {
    const newState = new AngularState();
    newState.alpha = Math.round( ( alpha - initialState.alpha ) * 100 ) / 100;
    newState.beta = Math.round( ( beta - initialState.beta ) * 100 ) / 100;
    newState.gamma = Math.round( ( gamma - initialState.gamma ) * 100 ) / 100;
    if ( newState.alpha < 0 ) {
      newState.alpha += 360;
    }
    if ( newState.beta < 0 ) {
      newState.beta += 360;
    }
    if ( newState.gamma < 0 ) {
      newState.gamma += 360;
    }
    return newState;
  };

  const getAcceleration = ( deg: number ): number => {
    let angular = 0;
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
    x: 'gamma',
    y: 'beta'
  };
  export class BallStatus {
    dimensions = {
      x: new BallPosition(),
      y: new BallPosition()
    };

    set( dimension: BallDimension, state: AngularState, limitLength: number ) {
      const deg = state[DirectionMap[dimension]];
      const target = this.dimensions[dimension];
      target.acceleration = - getAcceleration( deg );
      target.speed += Math.round( target.acceleration * 100 ) / 100;
      target.coordinate += Math.round( target.speed );
      if ( Math.abs( target.coordinate ) > limitLength ) {
        target.speed = 0;
        target.coordinate = limitLength * (target.coordinate > 0 ? 1 : -1);
      }
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
