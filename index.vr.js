import React from 'react';
import {
  AppRegistry,
  asset,
  Pano,
  Text,
  View,
  VrHeadModel,
  Animated
} from 'react-vr';

export default class VRHeadGestureDetection extends React.Component {

  constructor(props) {
    super(props);
    // a time out to clear the mouse positions
    this.timeout = null;
    // motions from the user
    this.motions = [];
    // state
    this.state = {
      lastPosition: {},
      motionDirection : Constants.MOTION_DIRECTION_NONE,
      motionDirectionString : "",
      gestureName: "",
      zPosition : -1
    }
    console.log(Easing);
  }

  componentDidMount() {  
  }

  onHeadPose(event){
    let currYPR = VrHeadModel.yawPitchRoll();
    let yaw = currYPR[0];
    let pitch = currYPR[1];
    // console.log('pitch: ', pitch);
    // console.log('yaw: ', yaw);
    // console.log(ReactVRConstants);
    var x = pitch, y = yaw;
    if (this.state.lastPosition) {
      // console.log("diff in y " + Math.abs( y - this.state.lastPosition.y));
      // console.log("diff in x " + Math.abs( x - this.state.lastPosition.x));
      if( Math.abs( y - this.state.lastPosition.y) > Constants.MOTION_THRESHOLD ){
        // significant motion on Y
        if (y > this.state.lastPosition.y) {
          // console.log("down");
          this.addPosition(Constants.MOTION_DOWN);
        } else {
          // console.log("up");
          this.addPosition(Constants.MOTION_UP);
        }
      } else if (Math.abs( x - this.state.lastPosition.x) > Constants.MOTION_THRESHOLD ) {
        // significant motion on X
        if (x > this.state.lastPosition.x) {
          // console.log("right");
          this.addPosition(Constants.MOTION_RIGHT);
        } else {
          // console.log("left");
          this.addPosition(Constants.MOTION_LEFT);
        }
      }
    }
    this.analyzeMotions();
    this.setState({lastPosition : {x : x, y: y}});
  }

  addPosition(pos) {
    this.motions.unshift(pos);
    if (this.state.motionDirection == Constants.MOTION_DIRECTION_UP_DOWN) {
      if(pos == Constants.MOTION_LEFT || pos == Constants.MOTION_RIGHT) {
        // added side motion when doing up down
        this.resetMotions();
        return;
      }
    } else if (this.state.motionDirection == Constants.MOTION_DIRECTION_LEFT_RIGHT) {
      if(pos == Constants.MOTION_UP || pos == Constants.MOTION_DOWN) {
        // added up/down motion when doing sideways
        this.resetMotions();
        return;
      }
    } else {
      if(pos == Constants.MOTION_UP || pos == Constants.MOTION_DOWN) {
        this.setState({ motionDirection : Constants.MOTION_DIRECTION_UP_DOWN, motionDirectionString: "UP/DOWN"});
      } else {
        this.setState({ motionDirection : Constants.MOTION_DIRECTION_LEFT_RIGHT, motionDirectionString: "LEFT/RIGHT"});
      }
    }
    if (this.motions.length == Constants.MOTION_NUMBER_TO_ANALYZE + 1) {
      this.motions.pop();
    }
  }

  analyzeMotions() {
    if (this.motions.length == Constants.MOTION_NUMBER_TO_ANALYZE) {
      let total = this.motions.reduce((t, n) => { return t += n }, 0);
      if (total == 0) {
        if (this.state.motionDirection == Constants.MOTION_DIRECTION_LEFT_RIGHT) {
          // no
          this.setState({gestureName : "NOPE!"})
          console.log("no!");
        } else if (this.state.motionDirection == Constants.MOTION_DIRECTION_UP_DOWN) {
          // yes
          this.setState({gestureName : "YEAH"})
          console.log("yes!");
        }
      }
    }
    // console.log(this.motions);
  }

  resetMotions() {
    this.motions = [];
    this.setState({ 
      lastPosition: null, 
      motionDirection : Constants.MOTION_DIRECTION_NONE, 
      motionDirectionString: "", 
      gestureName : ""});
  }

  render() {
    return (
      <View onHeadPose = {(event) => {
        this.onHeadPose(event);
      }}>
        <Pano source={asset('galaxydisk.png')}/>
        <View  
        id = "main"
        onInput = {(ev) => {
            //console.log(this); // refers to the React Component
            //{type: "MouseInputEvent", eventType: "mousemove", altKey: false, button: 0, buttons: 0, …}altKey: falsebutton: 0buttons: 0ctrlKey: falseeventType: "mousemove"metaKey: falseshiftKey: falsetype: "MouseInputEvent"viewportX: 0.30253025302530245viewportY: -0.8146487294469358__proto__: Object
            console.log(ev.nativeEvent.inputEvent);
            if (ev.nativeEvent.inputEvent.eventType == "click") {
              this.setState({zPosition : -2});
            }
          }
        }
        style = {{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: 1,
          height: 1,
          borderColor: 'white',
          borderWidth: 0.005,
          transform: [
            {translate: [-0.5, 0.5, this.state.zPosition]}
            ]
        }}>
          <Text
          pointerEvents = 'none'
          style={{
            fontSize: 0.125,
            height: 0.125,
            textAlign: 'center',
            textAlignVertical: 'center',
            opacity: 0.5,
            transform: [{translate: [0, 0, -1]}],
          }}>
          {this.state.motionDirectionString}
        </Text>
        <Text
          pointerEvents = 'none'
          style={{
            fontSize: 0.125,
            textAlign: 'center',
            height: 0.125,
            textAlignVertical: 'center',
            transform: [{translate: [0, 0, -1]}],
          }}>
          {this.state.gestureName}
        </Text>
      </View>
      
      </View>
    );
  }
}

// motion value constants
export const Constants = {
  MOTION_UP : -1,
  MOTION_DOWN : 1,
  MOTION_LEFT : 2,
  MOTION_RIGHT : -2,
  MOTION_THRESHOLD : 0.5,
  MOTION_DIRECTION_NONE : 0,
  MOTION_DIRECTION_UP_DOWN : 1,
  MOTION_DIRECTION_LEFT_RIGHT : 2,
  MOTION_NUMBER_TO_ANALYZE : 4
}

AppRegistry.registerComponent('react_vr_head_gesture', () => VRHeadGestureDetection);