import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import * as moment from 'moment';

@Injectable()
export class AudioProvider {
  private stop$ = new Subject();
  private audioObj = new Audio();

  constructor() { }

  private streamObservable(url) {
    let events = [
      'ended', 'error', 'play', 'playing', 'pause', 'timeupdate', 'canplay', 'loadedmetadata', 'loadstart'
    ];

    const addEvents = function(obj, events, handler) {
      events.forEach(event => {
        obj.addEventListener(event, handler);
      });
    };

    const removeEvents = function(obj, events, handler) {
      events.forEach(event => {
        obj.removeEventListener(event, handler);
      });
    };

    return Observable.create(observer => {
      // 再生オーディオ
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      // メディアイベント
      const handler = (event) => observer.next(event);
      addEvents(this.audioObj, events, handler);

      return () => {
        // 再生停止
        this.audioObj.pause();
        this.audioObj.currentTime = 0;

        // EventListeners を削除します
        removeEvents(this.audioObj, events, handler);
      };
    });
  }

  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  stop() {
    this.stop$.next();
  }

  seekTo(seconds) {
    this.audioObj.currentTime = seconds;
  }

  formatTime(time, format) {
    return moment.utc(time).format(format);
  }
  
  playStream(url) {
    return this.streamObservable(url).pipe(takeUntil(this.stop$));
  }
}