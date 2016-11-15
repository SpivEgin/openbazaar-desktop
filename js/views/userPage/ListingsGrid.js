import app from '../../app';
import BaseVw from '../baseVw';
import ListingCard from '../ListingCard';

export default class extends BaseVw {
  constructor(options = {}) {
    const opts = {
      viewType: 'grid',
      ...options,
    };

    super(opts);
    this.options = opts;

    if (!this.collection) {
      throw new Error('Please provide a collection.');
    }

    if (!this.options.storeOwner) {
      // For search and channels this will need to be provided
      // with the listing index data, in which case this
      // option could be made truly optional.
      throw new Error('Please provide the guid of the storeOwner.');
    }

    this.setCollection(this.collection);
    this.viewType = app.localSettings.get('listingsGridViewType');
    this.listingCardViews = [];
  }

  className() {
    return 'listingsGrid flex';
  }

  setCollection(cl) {
    if (!cl) {
      throw new Error('Please provide a collection.');
    }

    this.stopListening(this.collection);
    this.collection = cl;

    this.listenTo(this.collection, 'update', (updatedCl, updateOpts) => {
      // The only updates we're expecting are a new "page" of
      // listings being added to the end of the collection.
      if (updateOpts.add) {
        this.renderListingCards(updateOpts.changes.added);
      }
    });
  }

  get viewType() {
    return this._viewType;
  }

  set viewType(type) {
    if (['list', 'grid'].indexOf(type) === '-1') {
      throw new Error('The type provided is not one of the available types.');
    }

    const prevType = this._viewType;
    this._viewType = type;
    app.localSettings.save('listingsGridViewType', type);

    if (prevType) {
      if (prevType !== this._viewType) {
        this.$el.toggleClass('listingsGridListView');
      }
    } else if (type === 'list') {
      this.$el.addClass('listingsGridListView');
    }
  }

  get listingCount() {
    return this.listingCardViews ?
      this.listingCardViews.length : 0;
  }

  createListingCardView(opts = {}) {
    const options = {
      ownListing: this.options.storeOwner === app.profile.id,
      listingBaseUrl: `${this.options.storeOwner}/store/`,
      ...opts,
    };

    return this.createChild(ListingCard, options);
  }

  renderListingCards(models = []) {
    const listingsFrag = document.createDocumentFragment();

    models.forEach(model => {
      const listingCardVw = this.createListingCardView({ model });
      this.listingCardViews.push(listingCardVw);
      listingCardVw.render().$el.appendTo(listingsFrag);
    });

    this.$el.append(listingsFrag);
  }

  render() {
    this.listingCardViews.forEach(vw => vw.remove());
    this.listingCardViews = [];
    this.$el.empty();
    this.renderListingCards(this.collection);

    return this;
  }
}

export const LISTINGS_PER_PAGE = 25;