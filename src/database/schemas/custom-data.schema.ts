import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  strict: false // Permite estruturas dinâmicas aninhadas
})
export class CustomData extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  schemaId: Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

export const CustomDataSchema = SchemaFactory.createForClass(CustomData); 