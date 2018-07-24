/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */


/**
 * A class that wraps webcam video elements to capture Tensor4Ds.
 */
class Webcam {
  /**
   * @param {HTMLVideoElement} webcamElement A HTMLVideoElement representing the webcam feed.
   */
  constructor(webcamElement) {
    this.webcamElement = webcamElement;
  }

  /**
   * Captures a frame from the webcam and normalizes it between -1 and 1.
   * Returns a batched image (1-element batch) of shape [1, w, h, c].
   *
   * apropria-se de um quadro da webcam e normaliza-o entre -1 e 1.
   * Retorna uma imagem em lote (lote de 1 elemento) de forma [1, w, h, c].
   */
  capture() {
    return tf.tidy(() => {
      // Reads the image as a Tensor from the webcam <video> element.
      // Lê a imagem como um Tensor do elemento <video> da webcam.
      const webcamImage = tf.fromPixels(this.webcamElement);
      console.log(webcamImage);
      
      // Crop the image so we're using the center square of the rectangular
      // webcam.
      // Cortar a imagem, então estamos usando o quadrado central da retangular Webcam.
      const croppedImage = this.cropImage(webcamImage);

      const grayImage = this.toGray(croppedImage);

      

      var canvas = document.getElementById("tutorial"),
      ctx = canvas.getContext("2d").drawImage(videoElement, 0, 0, videoElement.width, videoElement.height),
      

     img = [3,4,5,5,1,2,3,4,5,5,1,2,3,4,5,5,1,2,3,4,5,5,1,2,3,4,5,5,1,2,3,4,5,3,4,5,3,4,5,3,4,5,3,4,5,3,4,5,3,4,5,3,4,
     5,3,4,5,3,4,5,3,4,5,5,1,2,3,4,5,5,1,2,3,4,5,5,1,2,3,4,5,5,1,2,3,4,5,5,1,2,3,4,
     5,5,1,2,3,4,5,5,5,5,1,2,3,4,5,5,5,5,1,2,3,4,5,55,5,1,2,3,4,5,55,5,1,2,3,4,5,55,5,1,2,3,4,5,55,5,1,2,3,4,5,5]

      var imgData = ctx.createImageData(32,32);
      var data = imgData.data;

      for(var i=0,len = img.length; i<len;i++){
        data[i] = img[i];
      }

      ctx.putImageData(imgData, 0, 0);
      // Expand the outer most dimension so we have a batch size of 1.
      // Expanda a dimensão mais externa, de modo que tenhamos um tamanho de lote de 1.
      const batchedImage = grayImage.expandDims(2);
      // Normalize the image between -1 and 1. The image comes in between 0-255,
      // so we divide by 127 and subtract 1.      
      return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    });
  }

  toGray(img){
    return img.mean(2).expandDims(2);
  }

  /**
   * Crops an image tensor so we get a square image with no white space.
   * @param {Tensor4D} img An input image Tensor to crop.
   */
  cropImage(img) {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);

    const sliceImage = img.slice([beginHeight, beginWidth, 0], [size,size,3]);
    return tf.image.resizeBilinear(sliceImage,[32,32])
  }

  /**
   * Adjusts the video size so we can make a centered square crop without
   * including whitespace.
   * @param {number} width The real width of the video element.
   * @param {number} height The real height of the video element.
   */
  adjustVideoSize(width, height) {
    const aspectRatio = width / height;
    if (width >= height) {
      this.webcamElement.width = aspectRatio * this.webcamElement.height;
    } else if (width < height) {
      this.webcamElement.height = this.webcamElement.width / aspectRatio;
    }
  }

  async setup() {
    return new Promise((resolve, reject) => {
      const navigatorAny = navigator;
      navigator.getUserMedia = navigator.getUserMedia ||
          navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
          navigatorAny.msGetUserMedia;
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
            {video: true},
            stream => {
              this.webcamElement.srcObject = stream;
              this.webcamElement.addEventListener('loadeddata', async () => {
                this.adjustVideoSize(
                    this.webcamElement.videoWidth,
                    this.webcamElement.videoHeight);
                resolve();
              }, false);
            },
            error => {
              document.querySelector('#no-webcam').style.display = 'block';
            });
      } else {
        reject();
      }
    });
  }
}





//https://www.jonathan-petitcolas.com/2016/08/24/taking-picture-from-webcam-using-canvas.html