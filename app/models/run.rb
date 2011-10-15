class Run
  include MongoMapper::EmbeddedDocument

  key :count, Integer
  key :card_id, BSON::ObjectId

  one :edit_props

  belongs_to :card

  delegate :cardtype, :name, :cmc, :cc, :mtg_id, :oracle_text, :to => :card

  def category
    case cardtype
    when Card::LAND_REGEX
      'land'
    when Card::CREATURE_REGEX
      'creature'
    else
      'spell'
    end
  end

end
