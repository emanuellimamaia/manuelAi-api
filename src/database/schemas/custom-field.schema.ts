import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CustomField extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['string', 'number', 'boolean', 'date', 'array', 'object'] })
  type: string;

  @Prop({ type: [Object] }) // Para campos aninhados
  subfields?: CustomField[];

  @Prop({ type: Object })
  options: Record<string, any>;
}

export const CustomFieldSchema = SchemaFactory.createForClass(CustomField); 