import React, { Component } from 'react';
import { Platform, StyleSheet, Image, Text, View, TouchableOpacity } from 'react-native';
import Tflite from 'tflite-react-native';
import ImagePicker from 'react-native-image-picker';

let tflite = new Tflite();

const height = 350;
const width = 350;
const blue = "#25d5fd";

export default class PredictImage extends Component {
  constructor() {
    super();
    this.state = {
      source: null,
      imageHeight: height,
      imageWidth: width,
      recognitions: []
    };
  }

  componentDidMount () {
    var modelFile = '8class.tflite';
    var labelsFile = '8class.txt';
    tflite.loadModel({
      model: modelFile,
      labels: labelsFile,
      numThreads: 1,
    },
      (err, res) => {
        if (err)
          console.log(err);
        else
          console.log(res);
      });
    console.log(tflite)
  }
    
  onSelectImage() {
    const options = {
      title: 'Select Avatar',
      customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        var path ='file://' + response.path;
        console.log(path);
        var w = response.width;
        var h = response.height;
        this.setState({
          source: { uri: path },
          imageHeight: h * width / w,
          imageWidth: width
        });

        tflite.runModelOnImage({
          path: path,
          imageMean: 128.0,
          imageStd: 128.0,
          numResults: 5,
          threshold: 0.05
        },
          (err, res) => {
            if (err)
              console.log(err);
            else
              this.setState({ recognitions: res });
          });
      }
    });
  }

  renderResults() {
    const { recognitions, imageHeight, imageWidth } = this.state;
    return recognitions.map((res, id) => {
      console.log(res, id);
      return (
        <Text key={id} style={{ color: 'blue', fontSize:40 }}>
          {res["label"] + "-" + (res["confidence"] * 100).toFixed(0) + "%"}
        </Text>
      )
    });
  }

  render() {
    const { source, imageHeight, imageWidth } = this.state;
    return (
      <View style={styles.container}>
          <TouchableOpacity style={
            [styles.imageContainer, {
              height: imageHeight,
              width: imageWidth,
              borderWidth: source ? 0 : 2
            }]} onPress={this.onSelectImage.bind(this)}>
            {
              source ?
                <Image source={source} style={{
                  height: imageHeight, width: imageWidth
                }} resizeMode="contain" /> :
                <Text style={styles.text}>Select Picture</Text>
            }
            <View style={styles.boxes}>
              {this.renderResults()}
            </View>
          </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  imageContainer: {
    borderColor: blue,
    borderRadius: 5,
    alignItems: "center"
  },
  text: {
    color: blue
  },
  button: {
    width: 200,
    backgroundColor: blue,
    borderRadius: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 15
  },
  box: {
    position: 'absolute',
    borderColor: blue,
    borderWidth: 2,
  },
  boxes: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  }
});
