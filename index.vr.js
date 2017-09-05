import React from 'react';
import {
  AppRegistry,
  asset,
  Pano,
  Text,
  View,
  VrHeadModel,
  StyleSheet
} from 'react-vr';

export default class VRHeadGestureDetection extends React.Component {

  constructor(props) {
    super(props);

    // setup some styles
    var containerWidth = 1, containerHeight = 0.5, textHeight = containerHeight / 2;
    this.styles = StyleSheet.create({
      container: {
        position: 'absolute',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: containerWidth,
        height: containerHeight,
        borderColor: 'white',
        borderWidth: 0.005,
        transform: [ {translate: [-0.5, 0.25, -1]}]
      },
      text : {
        fontSize: 0.05,
        height: 0.075,
        width: containerWidth * 0.8,
        textAlign: 'center',
        textAlignVertical: 'center',
        transform: [{translate: [0, 0, 0]}]
      }
    });

    // motions from the user
    this.motions = [];

    // state
    this.state = {
      lastPosition: {},
      motionDirection : Constants.MOTION_DIRECTION_NONE,
      motionDirectionString : "HEAD GESTURE DEMO",
      gestureName: "NOD TO START",
      debug: true
    }
  }

  /**
   * `onHeadPose` collects the pitch and yaw properties stored in VrHeadModel. 
   * It will check the current values and compare them with the previous saved values to assess if a threshold of motion in either axis has occurred.
   * When significant motion is detected in pitch or yaw, a value (stored in Constants) identifying the motion will be added to the `motions` property in the state via the `addMotion` function, afterwards the values in the `positions` Array are analyzed in the `analyzPositions()` function. 
   */
  onHeadPose() {
    let currYPR = VrHeadModel.yawPitchRoll(), yaw = currYPR[0], pitch = currYPR[1];
    if (this.state.lastPosition) {
      if(Math.abs( yaw - this.state.lastPosition.yaw) > Constants.MOTION_THRESHOLD) {
        // significant motion on Y
        if (yaw > this.state.lastPosition.yaw) {
          this.addMotion(Constants.MOTION_DOWN);
        } else {
          this.addMotion(Constants.MOTION_UP);
        }
      } else if (Math.abs(pitch - this.state.lastPosition.pitch) > Constants.MOTION_THRESHOLD) {
        // significant motion on X
        if (pitch > this.state.lastPosition.pitch) {
          this.addMotion(Constants.MOTION_RIGHT);
        } else {
          this.addMotion(Constants.MOTION_LEFT);
        }
      }
    }
    this.analyzeMotions();
    this.setState({lastPosition : { pitch : pitch, yaw: yaw }});
  }

  /**
   * `addMotion` takes a numeric value representing a motion direction and stores into the first position of the `motions` property.
   * 
   * For the purpouses of gesture detection, the following validation is performed :
   * 
   *  - The `motions` Array may only hold the latest 4 positions.
   *  - The `motions` Array may only hold position values that occur in the same axis of motion (either pitch or yaw motions). When a change of axis is detected, the `motions` array is reset. A `motionDirection` property is used to enable this check.
   * 
   * @param {Number} newMotion A Numeric number identifying a motion in yaw (up/down) or pitch (left/right)
   */
  addMotion(newMotion) {
    if (this.state.motionDirection == Constants.MOTION_DIRECTION_UP_DOWN) {
      if(newMotion == Constants.MOTION_LEFT || newMotion == Constants.MOTION_RIGHT) {
        // added pitch motion when the current direction is yaw
        this.resetMotions();
        return;
      }
    } else if (this.state.motionDirection == Constants.MOTION_DIRECTION_LEFT_RIGHT) {
      if(newMotion == Constants.MOTION_UP || newMotion == Constants.MOTION_DOWN) {
        // added yaw motion when the current direction is pitch
        this.resetMotions();
        return;
      }
    } else {
      // no `motionDirection` stablished yet, set from the value in `newMotion`
      if(newMotion == Constants.MOTION_UP || newMotion == Constants.MOTION_DOWN) {
        this.setState({ motionDirection : Constants.MOTION_DIRECTION_UP_DOWN, motionDirectionString: "HEAD MOTION: UP/DOWN"});
      } else {
        this.setState({ motionDirection : Constants.MOTION_DIRECTION_LEFT_RIGHT, motionDirectionString: "HEAD MOTION: LEFT/RIGHT"});
      }
    }
    // add this motion at the begining of the `motions` Array
    this.motions.unshift(newMotion);
    // keep the size of the `motions` Array to 4
    if (this.motions.length == Constants.MOTION_NUMBER_TO_ANALYZE + 1) {
      this.motions.pop();
    }
  }

  /**
   * This function takes the `motions` Array which at this point should only contain 4 numbers describing motions in the same axis.
   * It will take the values in the Array and add them up, if their sum is zero it means it has found 2 opposing motions (2 up, 2 down or 2 left, 2 right) which is the minimum required to recognize a up/down or side/side head motions.
   */
  analyzeMotions() {
    if (this.motions.length == Constants.MOTION_NUMBER_TO_ANALYZE) {
      let total = this.motions.reduce((t, n) => { return t += n }, 0);
      if (total == 0) {
        if (this.state.motionDirection == Constants.MOTION_DIRECTION_LEFT_RIGHT) {
          // no
          this.setState({gestureName : "DETECTED HEAD GESTURE: NO"})
          console.log("no!");
        } else if (this.state.motionDirection == Constants.MOTION_DIRECTION_UP_DOWN) {
          // yes
          this.setState({gestureName : "DETECTED HEAD GESTURE: YES"})
          console.log("yes!");
        }
      }
    }
  }

  resetMotions() {
    this.motions = [];
    this.setState({ 
      lastPosition: null, 
      motionDirection : Constants.MOTION_DIRECTION_NONE, 
      motionDirectionString: "", 
      gestureName : ""
    });
  }

  render() {
    return (
      <View 
      onHeadPose = {() => {
        this.onHeadPose();
      }}>

        <Pano source={ this.props.panoSource == null ? asset('galaxydisk.png') : this.props.panoSource }/>
        
        {this.state.debug ? 
        <View  
          style = {this.styles.container} >
            <Text
              pointerEvents = 'none'
              style = {this.styles.text} >
            {this.state.motionDirectionString}
            </Text>
            <Text
              pointerEvents = 'none'
              style = {this.styles.text} >
              {this.state.gestureName}
            </Text>
        </View>
        : null }
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