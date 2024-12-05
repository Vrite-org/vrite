defmodule VriteBackend.ETSSetup do
  @table_name :document_store

  # Call this function to create the ETS table
  def create_table do
    unless :ets.info(@table_name) do
      IO.puts("Creating ETS table #{@table_name}")
      :ets.new(@table_name, [:set, :public, :named_table])
    else
      IO.puts("ETS table #{@table_name} already exists")
    end
  end
end
