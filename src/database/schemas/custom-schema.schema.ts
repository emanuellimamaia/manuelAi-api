import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CustomField } from './custom-field.schema';

@Schema({ timestamps: true })
export class CustomSchema extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [CustomField] })
  fields: CustomField[];
}

export const CustomSchemaSchema = SchemaFactory.createForClass(CustomSchema); 