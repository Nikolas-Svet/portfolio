export interface IDocument {
  id: number,
  description: string,
  id_dict_terytory: number,
  id_dict_type_file: number,
  name_file: string,
  size: number,
  uuid_file: string,
  name_type?: string | null,
}