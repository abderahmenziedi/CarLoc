import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocateurHomePage } from './locateur-home.page';

describe('LocateurHomePage', () => {
  let component: LocateurHomePage;
  let fixture: ComponentFixture<LocateurHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LocateurHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
