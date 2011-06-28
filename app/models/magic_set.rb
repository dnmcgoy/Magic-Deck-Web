class MagicSet
  include MongoMapper::Document

  key :name, String
  key :short_name, String
  key :release_date, Date

  def imageUrl(size, rarity)
    return "http://gatherer.wizards.com/Handlers/Image.ashx?type=symbol&set=" + self.short_name + "&size=" + size + "&rarity=" + rarity
  end

end
