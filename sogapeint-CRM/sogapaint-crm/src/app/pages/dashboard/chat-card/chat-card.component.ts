import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ChatMessage {
  align: 'left' | 'right';
  name: string;
  message: string;
  time: string;
  image: string;
  text?: string;
}

@Component({
  selector: 'app-chat-card',
  templateUrl: './chat-card.component.html',
  styleUrls: ['./chat-card.component.scss']
})
export class ChatCardComponent implements OnInit {
  selectedEmoji:any;

  chatData: ChatMessage[] = [
    {
      align: 'left',
      name: 'Adrien Godoy',
      message: 'Hello!',
      time: '10:00',
      image: 'assets/images/users/avatar-1.jpg'
    },
    {
      align: 'right',
      name: 'You',
      message: 'Hi!',
      time: '10:01',
      image: ''
    }
  ];

  formData: FormGroup;
  chatSubmit = false;
  emojiPickerVisible = false;

  constructor(private fb: FormBuilder) {
    this.formData = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  get form() {
    return this.formData.controls;
  }

  toggleEmojiPicker() {
    this.emojiPickerVisible = !this.emojiPickerVisible;
  }

  select($event)
  {
    console.log($event);
    this.selectedEmoji = $event.emoji;
    // this.pasteHtmlAtCaret("<span>hi</span>");
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    const messageControl = this.form.message;
    messageControl.setValue(messageControl.value + emoji);
  }

  messageSave() {
    this.chatSubmit = true;
    if (this.formData.invalid) {
      return;
    }

    const newMessage: ChatMessage = {
      align: 'right',
      name: 'You',
      message: this.formData.value.message,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      image: ''
    };

    this.chatData.push(newMessage);
    this.formData.reset();
    this.chatSubmit = false;
  }
}
