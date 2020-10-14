import { StatusBar } from 'expo-status-bar';
import React,{Component} from 'react';
import { StyleSheet, Text, View, Button, Image} from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import {Magnetometer} from 'expo-sensors';

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgChoice:{
    
  },
  img:{
    height:40,
    width:40,
    backgroundColor:'transparent',
    opacity:0.65,
  }
});

export default class App extends Component{
  constructor(props){
    super(props);
    this.state={
      img:null,
      location:null,
      v:null,
      theta:'0rad',
    }
  }

  getLocationAsync = async()=>{
    try{
      const {status} = await Permissions.askAsync(Permissions.LOCATION)
      if(status !== 'granted'){
        console.log('Permission not granted');
        return;
      }
      else{
        const location = await Location.getCurrentPositionAsync();
        this.setState({location});
      }
    }catch(err){
      console.log("getLocationAsyn: "+err)
    }
  }

  setupMagnetometerAsync = async () =>{
    Magnetometer.addListener(v=>{
      this.setState({v})
    })
  }

  componentDidMount(){
    this.getLocationAsync();
    this.setupMagnetometerAsync();
  }

  componentWillUnmount(){
    Magnetometer.removeAllListeners();
  }

  render(){

    let theta = '0rad';
    let angle;
    if(this.state.v){
      let {x,y,z} =this.state.v
      angle = Math.atan2(y, x);
      angle = angle * (180 / Math.PI)
      angle = angle + 90
      angle = (angle +360) % 360
      angle = angle + 45
    }


    
    if(this.state.v){
      let {x,y,z} =this.state.v
      theta = Math.atan(-x/y);
      if(-x > 0 && y > 0){
       // 
      }else if(y>0){
        theta += Math.PI
      }else{
        theta += Math.PI *2
      }
    }

    if(!this.state.img){
      return (
        <View style={styles.container}>
        <View style={styles.imgChoice}>
          <Button title='Male' onPress={()=>this.setState({img:require('./img/man.jpg')})} />
          <Button title='Female' onPress={()=>this.setState({img:require('./img/girl.png')})} />
        </View>
      </View>
        )
    }else if(!this.state.location){
        return(<View style={styles.container}><Text>LOADING...</Text></View>);
    }
    else{
      return(
        <MapView style={{flex:1}} initialRegion={{
          latitude:this.state.location.coords.latitude,
          longitude:this.state.location.coords.longitude,
          latitudeDelta:0.01,
          longitudeDelta:0.02
        }}>
        <MapView.Marker coordinate={this.state.location.coords}>
           <Image source={this.state.img} style={[styles.img, {
                                            transform: [{ rotate: angle+"deg" }]}]} />
        </MapView.Marker>
        </MapView>
        );
    }
    
  }
}
