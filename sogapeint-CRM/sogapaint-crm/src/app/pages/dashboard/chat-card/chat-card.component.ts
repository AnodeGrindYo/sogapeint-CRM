import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { UserProfileService } from 'src/app/core/services/user.service';

interface ChatMessage {
  name: string;
  message: string;
  align?: 'left' | 'right';
  showName?: boolean;
  time: string;
  image: string;
  user: any;
  localId?: number; // Ajouter une propriété unique
}

@Component({
  selector: 'app-chat-card',
  templateUrl: './chat-card.component.html',
  styleUrls: ['./chat-card.component.scss']
})
export class ChatCardComponent implements OnInit {
  selectedEmoji: any;
  chatData: any[] = [];
  formData: FormGroup;
  chatSubmit = false;
  emojiPickerVisible = false;
  days = 7; // Charger les messages des 7 derniers jours par défaut
  currentUser: any;
  @ViewChild('chatWidget') private chatWidget!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private userProfileService: UserProfileService
  ) {
    this.formData = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.userProfileService.getCurrentUser();
    console.log('currentUser', this.currentUser);
    this.loadChatData();
    this.chatService.onNewMessage().subscribe((message: any) => {
      // Vérifiez si le message a un localId pour éviter les doublons
      if (!message.localId || !this.chatData.some(m => m.localId === message.localId)) {
        this.chatData.push(this.adjustMessageAlignment(message));
        this.scrollToBottom();
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  get form() {
    return this.formData.controls;
  }

  toggleEmojiPicker() {
    this.emojiPickerVisible = !this.emojiPickerVisible;
  }

  select($event: any) {
    this.selectedEmoji = $event.emoji;
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    const messageControl = this.form.message;
    messageControl.setValue(messageControl.value + emoji);
  }

  loadChatData() {
    this.chatService.getMessages(this.days).subscribe(data => {
      this.chatData = data.map((message: any) => this.adjustMessageAlignment(message));
      // this.scrollToBottom();
    });
  }

  loadMoreMessages() {
    this.days += 7;
    this.chatService.getMessages(this.days).subscribe(data => {
      const adjustedMessages = data.map((message: any) => this.adjustMessageAlignment(message));
      this.chatData = adjustedMessages.concat(this.chatData);
      // this.scrollToBottom();
    });
  }

  messageSave() {
    this.chatSubmit = true;
    if (this.formData.invalid) {
      return;
    }

    const newMessage: ChatMessage = {
      name: `${this.currentUser.firstname} ${this.currentUser.lastname}`,
      message: this.formData.value.message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: '',
      user: this.currentUser.userId,
      localId: Date.now() // Ajouter une propriété unique
    };

    this.chatService.sendMessage({
      userId: this.currentUser.userId,
      message: newMessage.message
    }).subscribe(response => {
      this.formData.reset();
      // newMessage.align = 'right'; // NOPE
      // newMessage.showName = false; // NOPE
      // this.chatData.push(newMessage); // NOPE
      this.chatSubmit = false;
    });
  }

  adjustMessageAlignment(message: any): any {
    console.log('message', message);
    message.align = message.user._id === this.currentUser.userId ? 'right' : 'left';
    message.showName = message.align === 'left';
    if (message.showName) {
      message.name = `${message.user.firstname} ${message.user.lastname}`;
    }
    return message;
  }

  scrollToBottom(): void {
    try {
      this.chatWidget.nativeElement.scrollTop = this.chatWidget.nativeElement.scrollHeight;
    } catch(err) {
      console.error('Scroll to bottom failed', err);
    }
  }
  
}
